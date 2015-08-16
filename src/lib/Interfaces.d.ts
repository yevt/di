/**
 * Created by y.evtushenko on 07.08.15.
 */
/// <reference path="./references.d.ts" />

declare type IService = any;
declare type IComponentId = string;
//declare type DependencyId = string;
declare type IFactory = Function;

interface IOptions {
    get(path:string):any;
    destroy();
}

interface IComponentOptions {
    id?:IComponentId;
    func?:Function;
    obj?:any;
    dependencies?:IComponentId[];
    inject?: {
        intoConstructor?:Object
        intoInstance?:Object
    };
}

interface IComponent {
    getService(dependantServices?:IService[]):Q.Promise<IService>;
    getOptions():IOptions;
    destroy();
}

interface IContextOptions {
    components?: IComponentOptions[] | IComponentOptions | {[key: string]: IComponentOptions};
    parentContext?: IContext;
}

interface IContext {
    destroy();
    register(options:IComponentOptions, overwrite?:boolean):void;
    get(id:IComponentId):Q.Promise<IService>;
}

interface IValidationResult {
    status: boolean;
}