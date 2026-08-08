using System;
using System.Collections.Generic;
using System.Threading;
using static InputHelper.Win32;

namespace InputHelper
{
    internal static class InputController
    {
        private const int WHEEL_DELTA = 120;
        private const int MoveStepIntervalMs = 12;
        private const int DoubleClickGapMs = 60;

        internal static (int x, int y) GetCursorPos()
        {
            Win32.GetCursorPos(out var p);
            return (p.X, p.Y);
        }

        internal static void MoveMouse(int x, int y, int durationMs, bool relative)
        {
            var (curX, curY) = GetCursorPos();
            int targetX = relative ? curX + x : x;
            int targetY = relative ? curY + y : y;

            if (durationMs <= 0)
            {
                SendAbsoluteMove(targetX, targetY);
                return;
            }

            int steps = Math.Max(1, durationMs / MoveStepIntervalMs);
            for (int i = 1; i <= steps; i++)
            {
                double t = (double)i / steps;
                int stepX = (int)Math.Round(curX + (targetX - curX) * t);
                int stepY = (int)Math.Round(curY + (targetY - curY) * t);
                SendAbsoluteMove(stepX, stepY);
                if (i < steps) Thread.Sleep(MoveStepIntervalMs);
            }
        }

        private static void SendAbsoluteMove(int x, int y)
        {
            var (vx, vy, vw, vh) = GetVirtualScreen();
            double normX = (x - vx) * 65535.0 / Math.Max(1, vw - 1);
            double normY = (y - vy) * 65535.0 / Math.Max(1, vh - 1);

            var input = new INPUT
            {
                type = INPUT_MOUSE,
                U = new InputUnion
                {
                    mi = new MOUSEINPUT
                    {
                        dx = (int)Math.Round(normX),
                        dy = (int)Math.Round(normY),
                        mouseData = 0,
                        dwFlags = MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_VIRTUALDESK,
                        time = 0,
                        dwExtraInfo = IntPtr.Zero
                    }
                }
            };
            SendInput(1, new[] { input }, System.Runtime.InteropServices.Marshal.SizeOf<INPUT>());
        }

        private static void SendMouseButton(uint flag, uint mouseData = 0)
        {
            var input = new INPUT
            {
                type = INPUT_MOUSE,
                U = new InputUnion
                {
                    mi = new MOUSEINPUT
                    {
                        dx = 0,
                        dy = 0,
                        mouseData = mouseData,
                        dwFlags = flag,
                        time = 0,
                        dwExtraInfo = IntPtr.Zero
                    }
                }
            };
            SendInput(1, new[] { input }, System.Runtime.InteropServices.Marshal.SizeOf<INPUT>());
        }

        internal static void Click(string button, string mode)
        {
            var (down, up) = button.ToLowerInvariant() switch
            {
                "right" => (MOUSEEVENTF_RIGHTDOWN, MOUSEEVENTF_RIGHTUP),
                "middle" => (MOUSEEVENTF_MIDDLEDOWN, MOUSEEVENTF_MIDDLEUP),
                _ => (MOUSEEVENTF_LEFTDOWN, MOUSEEVENTF_LEFTUP),
            };

            switch (mode.ToLowerInvariant())
            {
                case "down":
                    SendMouseButton(down);
                    break;
                case "up":
                    SendMouseButton(up);
                    break;
                case "double":
                    SendMouseButton(down);
                    SendMouseButton(up);
                    Thread.Sleep(DoubleClickGapMs);
                    SendMouseButton(down);
                    SendMouseButton(up);
                    break;
                default:
                    SendMouseButton(down);
                    SendMouseButton(up);
                    break;
            }
        }

        internal static void Scroll(string direction, int amount)
        {
            bool horizontal = direction.Equals("left", StringComparison.OrdinalIgnoreCase)
                || direction.Equals("right", StringComparison.OrdinalIgnoreCase);
            int sign = direction.Equals("down", StringComparison.OrdinalIgnoreCase)
                || direction.Equals("left", StringComparison.OrdinalIgnoreCase) ? -1 : 1;

            SendMouseButton(horizontal ? MOUSEEVENTF_HWHEEL : MOUSEEVENTF_WHEEL, unchecked((uint)(sign * amount * WHEEL_DELTA)));
        }

        private static void SendKeyEvent(ushort vk, bool keyUp)
        {
            var input = new INPUT
            {
                type = INPUT_KEYBOARD,
                U = new InputUnion
                {
                    ki = new KEYBDINPUT
                    {
                        wVk = vk,
                        wScan = 0,
                        dwFlags = keyUp ? KEYEVENTF_KEYUP : 0,
                        time = 0,
                        dwExtraInfo = IntPtr.Zero
                    }
                }
            };
            SendInput(1, new[] { input }, System.Runtime.InteropServices.Marshal.SizeOf<INPUT>());
        }

        internal static bool KeyAction(IReadOnlyList<string> keys, string mode, int holdMs, out string? error)
        {
            error = null;
            var vks = new List<ushort>();
            foreach (var k in keys)
            {
                if (!VirtualKeys.TryGetVk(k, out var vk))
                {
                    error = $"Unknown key: {k}";
                    return false;
                }
                vks.Add(vk);
            }

            switch (mode.ToLowerInvariant())
            {
                case "down":
                    foreach (var vk in vks) SendKeyEvent(vk, false);
                    break;
                case "up":
                    for (int i = vks.Count - 1; i >= 0; i--) SendKeyEvent(vks[i], true);
                    break;
                case "hold":
                    foreach (var vk in vks) SendKeyEvent(vk, false);
                    Thread.Sleep(Math.Max(0, holdMs));
                    for (int i = vks.Count - 1; i >= 0; i--) SendKeyEvent(vks[i], true);
                    break;
                default: // press
                    foreach (var vk in vks) SendKeyEvent(vk, false);
                    Thread.Sleep(20);
                    for (int i = vks.Count - 1; i >= 0; i--) SendKeyEvent(vks[i], true);
                    break;
            }
            return true;
        }

        private static void SendUnicodeChar(char c, bool keyUp)
        {
            var input = new INPUT
            {
                type = INPUT_KEYBOARD,
                U = new InputUnion
                {
                    ki = new KEYBDINPUT
                    {
                        wVk = 0,
                        wScan = c,
                        dwFlags = KEYEVENTF_UNICODE | (keyUp ? KEYEVENTF_KEYUP : 0),
                        time = 0,
                        dwExtraInfo = IntPtr.Zero
                    }
                }
            };
            SendInput(1, new[] { input }, System.Runtime.InteropServices.Marshal.SizeOf<INPUT>());
        }

        internal static void TypeText(string text, string mode, int charDelayMs)
        {
            if (mode.Equals("char-by-char", StringComparison.OrdinalIgnoreCase))
            {
                foreach (var c in text)
                {
                    SendUnicodeChar(c, false);
                    SendUnicodeChar(c, true);
                    if (charDelayMs > 0) Thread.Sleep(charDelayMs);
                }
            }
            else
            {
                var batch = new List<INPUT>(text.Length * 2);
                foreach (var c in text)
                {
                    batch.Add(new INPUT { type = INPUT_KEYBOARD, U = new InputUnion { ki = new KEYBDINPUT { wVk = 0, wScan = c, dwFlags = KEYEVENTF_UNICODE, time = 0, dwExtraInfo = IntPtr.Zero } } });
                    batch.Add(new INPUT { type = INPUT_KEYBOARD, U = new InputUnion { ki = new KEYBDINPUT { wVk = 0, wScan = c, dwFlags = KEYEVENTF_UNICODE | KEYEVENTF_KEYUP, time = 0, dwExtraInfo = IntPtr.Zero } } });
                }
                if (batch.Count > 0)
                    SendInput((uint)batch.Count, batch.ToArray(), System.Runtime.InteropServices.Marshal.SizeOf<INPUT>());
            }
        }
    }
}
