import log4js from 'log4js'

// Configuración de Log4JS
log4js.configure ({
    appenders: {
        // defino dos soportes de salida de datos
        consola: { type: 'console' },
        file_warning: { type: 'file', filename: './logs/warn.log' },
        file_debug: { type: 'file', filename: './logs/debug.log' },
        file_error: { type: 'file', filename: './logs/error.log' },

        // defino sus niveles de logueo
        loggerConsola: { type: 'logLevelFilter', appender: 'consola', level: 'info'},
        loggerArchivoWarning: { type: 'logLevelFilter', appender: 'file_warning', level: 'warn', maxLevel: 'warn'},
        loggerArchivoError: { type: 'logLevelFilter', appender: 'file_error', level: 'error'},
        loggerDebug: { type: 'logLevelFilter', appender: 'file_debug', level: 'debug'},
    },
    categories: {
        default: { 
            appenders: ["loggerConsola", "loggerArchivoWarning", "loggerArchivoError" ], 
            level:'ALL'
        },        
        Main: { 
            appenders: ["loggerConsola", "loggerArchivoWarning", "loggerArchivoError", "loggerDebug" ], 
            level:'ALL'
        },
        FrontEnd: { 
            appenders: ["loggerConsola", "loggerArchivoWarning", "loggerArchivoError", "loggerDebug" ], 
            level:'ALL'
        },
        BackEnd: { 
            appenders: ["loggerConsola", "loggerArchivoWarning", "loggerArchivoError", "loggerDebug" ], 
            level:'ALL'
        }
    }
});

// Establezco un loger para toda la aplicación
const loggerMain = log4js.getLogger('Main');  
const loggerFE = log4js.getLogger('FrontEnd'); 
const loggerBE = log4js.getLogger('BackEnd'); 


export { loggerMain, loggerFE, loggerBE };