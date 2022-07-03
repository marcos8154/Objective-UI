import { AppStorage } from "./AppStorage";

export interface IAppStorageProvider
{
    onStorageRequested(type: string, schemaName: string): AppStorage;
}