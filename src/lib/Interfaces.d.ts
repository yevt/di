/**
 * Created by y.evtushenko on 07.08.15.
 */

declare type IService = any;
declare type IComponentId = string;
//declare type DependencyId = string;
declare type IFactory = Function;

interface IOptions {
    get(path:string):any;
}

interface IComponentOptions {
    id:IComponentId;
    func:Function;
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
    components?: IComponentOptions[];
    parentContext?: IContext;
}

interface IContext {
    destroy();
    registerComponent(options:IComponentOptions, force?:boolean):void;
    getComponent(id:IComponentId):IComponent;
    get(id:IComponentId):Q.Promise<IService>;
}

interface IValidationResult {
    status: boolean;
}