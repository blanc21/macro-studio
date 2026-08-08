export const IpcChannels = {
  macrosList: 'macros:list',
  macrosGet: 'macros:get',
  macrosCreate: 'macros:create',
  macrosUpdate: 'macros:update',
  macrosRename: 'macros:rename',
  macrosDuplicate: 'macros:duplicate',
  macrosDelete: 'macros:delete',
  macrosExport: 'macros:export',
  macrosImport: 'macros:import',
  macrosRecordStats: 'macros:recordStats',
  statsGet: 'stats:get',

  settingsGet: 'settings:get',
  settingsUpdate: 'settings:update',

  engineStart: 'engine:start',
  enginePause: 'engine:pause',
  engineResume: 'engine:resume',
  engineStop: 'engine:stop',
  engineGetState: 'engine:getState',
  engineProgress: 'engine:progress',

  recordingStart: 'recording:start',
  recordingStop: 'recording:stop',
  recordingActionCaptured: 'recording:actionCaptured',

  pickerPosition: 'picker:position',
  pickerKey: 'picker:key',

  hotkeyTriggered: 'hotkey:triggered',

  windowMinimize: 'window:minimize',
  windowMaximize: 'window:maximize',
  windowClose: 'window:close'
} as const
