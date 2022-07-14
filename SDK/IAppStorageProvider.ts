import { AppStorage } from "./AppStorage";

/**
 * Implementing this interface in an inherited `UIPage` 
 * class will enable the Storage feature in your application. 
 * 
 * The purpose of this interface is to provide an instance of the 
 * implementation of the `AppStorage` class
 */
export interface IAppStorageProvider
{
    /**
     * Implementing this interface will provide 
     * local and session storage capabilities 
     * for your app
     * 
     * It will occur when any UIView requests this feature.
     * You must return an implementation instance of `AppStorage`
     *
     * By default, you can use `RhabooStorageWrapper` implementation 
     * which is provided by Objective-UI library
     * 
     * Example: 
     * 
     * ```
    onStorageRequested(type: string, schemaName: string): AppStorage
    {
        return new RhabooStorageWrapper(type, schemaName);
    }
     * ```
     * 
     * @param type `'local'` to LocalStorage or `'session'` to  SessionStorage
     * @param schemaName A unique name to demarcate a data context
     */
    onStorageRequested(type: string, schemaName: string): AppStorage;
}