export class ViewCache
{
    public path: string = '';
    public content: string = '';

    constructor(path: string, content: string)
    {
        this.path = path;
        this.content = content;
    }
}