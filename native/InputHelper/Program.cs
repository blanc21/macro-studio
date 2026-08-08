using System;
using System.Collections.Generic;
using System.Text.Json;

namespace InputHelper
{
    internal static class Program
    {
        private static void Main()
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
            string? line;
            while ((line = Console.In.ReadLine()) != null)
            {
                if (string.IsNullOrWhiteSpace(line)) continue;
                HandleLine(line);
            }
        }

        private static void HandleLine(string line)
        {
            string id = "";
            try
            {
                using var doc = JsonDocument.Parse(line);
                var root = doc.RootElement;
                id = root.TryGetProperty("id", out var idEl) ? idEl.GetString() ?? "" : "";
                var cmd = root.GetProperty("cmd").GetString() ?? "";

                switch (cmd)
                {
                    case "ping":
                        Reply(id, true);
                        break;

                    case "getCursorPos":
                    {
                        var (x, y) = InputController.GetCursorPos();
                        Reply(id, true, extra: new Dictionary<string, object> { ["x"] = x, ["y"] = y });
                        break;
                    }

                    case "moveMouse":
                    {
                        int x = root.GetProperty("x").GetInt32();
                        int y = root.GetProperty("y").GetInt32();
                        int duration = root.TryGetProperty("durationMs", out var d) ? d.GetInt32() : 0;
                        bool relative = root.TryGetProperty("relative", out var r) && r.GetBoolean();
                        InputController.MoveMouse(x, y, duration, relative);
                        Reply(id, true);
                        break;
                    }

                    case "click":
                    {
                        string button = root.TryGetProperty("button", out var b) ? b.GetString() ?? "left" : "left";
                        string mode = root.TryGetProperty("mode", out var m) ? m.GetString() ?? "single" : "single";
                        InputController.Click(button, mode);
                        Reply(id, true);
                        break;
                    }

                    case "scroll":
                    {
                        string direction = root.TryGetProperty("direction", out var dir) ? dir.GetString() ?? "down" : "down";
                        int amount = root.TryGetProperty("amount", out var a) ? a.GetInt32() : 1;
                        InputController.Scroll(direction, amount);
                        Reply(id, true);
                        break;
                    }

                    case "key":
                    {
                        var keys = new List<string>();
                        foreach (var k in root.GetProperty("keys").EnumerateArray())
                            keys.Add(k.GetString() ?? "");
                        string mode = root.TryGetProperty("mode", out var m) ? m.GetString() ?? "press" : "press";
                        int holdMs = root.TryGetProperty("holdMs", out var h) ? h.GetInt32() : 0;
                        if (InputController.KeyAction(keys, mode, holdMs, out var err))
                            Reply(id, true);
                        else
                            Reply(id, false, err);
                        break;
                    }

                    case "type":
                    {
                        string text = root.TryGetProperty("text", out var t) ? t.GetString() ?? "" : "";
                        string mode = root.TryGetProperty("mode", out var m) ? m.GetString() ?? "instant" : "instant";
                        int charDelay = root.TryGetProperty("charDelayMs", out var c) ? c.GetInt32() : 0;
                        InputController.TypeText(text, mode, charDelay);
                        Reply(id, true);
                        break;
                    }

                    default:
                        Reply(id, false, $"Unknown command: {cmd}");
                        break;
                }
            }
            catch (Exception ex)
            {
                Reply(id, false, ex.Message);
            }
        }

        private static void Reply(string id, bool ok, string? error = null, Dictionary<string, object>? extra = null)
        {
            var payload = new Dictionary<string, object?> { ["id"] = id, ["ok"] = ok };
            if (error != null) payload["error"] = error;
            if (extra != null)
                foreach (var kv in extra) payload[kv.Key] = kv.Value;

            Console.WriteLine(JsonSerializer.Serialize(payload));
            Console.Out.Flush();
        }
    }
}
