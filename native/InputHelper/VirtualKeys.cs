using System.Collections.Generic;

namespace InputHelper
{
    internal static class VirtualKeys
    {
        private static readonly Dictionary<string, ushort> Map = new(System.StringComparer.OrdinalIgnoreCase)
        {
            ["BACKSPACE"] = 0x08,
            ["TAB"] = 0x09,
            ["ENTER"] = 0x0D,
            ["RETURN"] = 0x0D,
            ["SHIFT"] = 0x10,
            ["CTRL"] = 0x11,
            ["CONTROL"] = 0x11,
            ["ALT"] = 0x12,
            ["PAUSE"] = 0x13,
            ["CAPSLOCK"] = 0x14,
            ["ESC"] = 0x1B,
            ["ESCAPE"] = 0x1B,
            ["SPACE"] = 0x20,
            ["PAGEUP"] = 0x21,
            ["PAGEDOWN"] = 0x22,
            ["END"] = 0x23,
            ["HOME"] = 0x24,
            ["LEFT"] = 0x25,
            ["UP"] = 0x26,
            ["RIGHT"] = 0x27,
            ["DOWN"] = 0x28,
            ["PRINTSCREEN"] = 0x2C,
            ["INSERT"] = 0x2D,
            ["DELETE"] = 0x2E,
            ["DEL"] = 0x2E,
            ["WIN"] = 0x5B,
            ["LWIN"] = 0x5B,
            ["RWIN"] = 0x5C,
            ["APPS"] = 0x5D,
            ["MENU"] = 0x5D,
            ["NUMLOCK"] = 0x90,
            ["SCROLLLOCK"] = 0x91,
            ["LSHIFT"] = 0xA0,
            ["RSHIFT"] = 0xA1,
            ["LCTRL"] = 0xA2,
            ["RCTRL"] = 0xA3,
            ["LALT"] = 0xA4,
            ["RALT"] = 0xA5,
            ["NUMPAD0"] = 0x60,
            ["NUMPAD1"] = 0x61,
            ["NUMPAD2"] = 0x62,
            ["NUMPAD3"] = 0x63,
            ["NUMPAD4"] = 0x64,
            ["NUMPAD5"] = 0x65,
            ["NUMPAD6"] = 0x66,
            ["NUMPAD7"] = 0x67,
            ["NUMPAD8"] = 0x68,
            ["NUMPAD9"] = 0x69,
            ["MULTIPLY"] = 0x6A,
            ["ADD"] = 0x6B,
            ["SUBTRACT"] = 0x6D,
            ["DECIMAL"] = 0x6E,
            ["DIVIDE"] = 0x6F,
            [";"] = 0xBA,
            ["="] = 0xBB,
            [","] = 0xBC,
            ["-"] = 0xBD,
            ["."] = 0xBE,
            ["/"] = 0xBF,
            ["`"] = 0xC0,
            ["["] = 0xDB,
            ["\\"] = 0xDC,
            ["]"] = 0xDD,
            ["'"] = 0xDE,
        };

        static VirtualKeys()
        {
            for (char c = '0'; c <= '9'; c++) Map[c.ToString()] = (ushort)c;
            for (char c = 'A'; c <= 'Z'; c++) Map[c.ToString()] = (ushort)c;
            for (int i = 1; i <= 24; i++) Map[$"F{i}"] = (ushort)(0x70 + i - 1);
        }

        internal static bool TryGetVk(string key, out ushort vk)
        {
            return Map.TryGetValue(key.Trim(), out vk);
        }

        internal static bool IsModifier(string key)
        {
            var k = key.Trim().ToUpperInvariant();
            return k is "SHIFT" or "CTRL" or "CONTROL" or "ALT" or "WIN" or "LSHIFT" or "RSHIFT"
                or "LCTRL" or "RCTRL" or "LALT" or "RALT" or "LWIN" or "RWIN";
        }
    }
}
