"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withFirebaseAppDelegate = exports.modifyObjcAppDelegate = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
const fs_1 = __importDefault(require("fs"));
const methodInvocationBlock = `[FIRApp configure];`;
// https://regex101.com/r/Imm3E8/1
const methodInvocationLineMatcher = /(?:(self\.|_)(\w+)\s?=\s?\[\[UMModuleRegistryAdapter alloc\])|(?:RCTBridge\s?\*\s?(\w+)\s?=\s?\[\[RCTBridge alloc\])/g;
function modifyObjcAppDelegate(contents) {
    // Add import
    if (!contents.includes('@import Firebase;')) {
        contents = contents.replace(/#import "AppDelegate.h"/g, `#import "AppDelegate.h"
@import Firebase;`);
    }
    // To avoid potential issues with existing changes from older plugin versions
    if (contents.includes(methodInvocationBlock)) {
        return contents;
    }
    // Add invocation
    return (0, generateCode_1.mergeContents)({
        tag: '@react-native-firebase/app-didFinishLaunchingWithOptions',
        src: contents,
        newSrc: methodInvocationBlock,
        anchor: methodInvocationLineMatcher,
        offset: 0,
        comment: '//',
    }).contents;
}
exports.modifyObjcAppDelegate = modifyObjcAppDelegate;
const withFirebaseAppDelegate = config => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        'ios',
        async (config) => {
            const fileInfo = config_plugins_1.IOSConfig.Paths.getAppDelegate(config.modRequest.projectRoot);
            let contents = await fs_1.default.promises.readFile(fileInfo.path, 'utf-8');
            if (fileInfo.language === 'objc') {
                contents = modifyObjcAppDelegate(contents);
            }
            else {
                // TODO: Support Swift
                throw new Error(`Cannot add Firebase code to AppDelegate of language "${fileInfo.language}"`);
            }
            await fs_1.default.promises.writeFile(fileInfo.path, contents);
            return config;
        },
    ]);
};
exports.withFirebaseAppDelegate = withFirebaseAppDelegate;
