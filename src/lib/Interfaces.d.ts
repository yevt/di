/**
 * Created by y.evtushenko on 07.08.15.
 */

declare type IService = any;
declare type ComponentId = string;
//declare type DependencyId = string;
declare type IFactory = Function;

declare type IFactoryWrapper = (Factory) => IFactory

interface IOptions {
    get(path:string):any;
}

interface IComponentOptions {
    id:ComponentId;
    func:Function;
    dependencies?:ComponentId[];
    inject?: {
        intoConstructor?:Object
        intoInstance?:Object
    };
}

interface IComponent {
    getService(dependantServices?:IService[]):Q.Promise<IService>;
    getOptions():IOptions;
}

interface IContextOptions {
    components?: IComponentOptions[];
    parentContext?: IContext;
}

interface IContext {
    destroy();
    registerComponent(options:IComponentOptions);
    hasComponent(id:ComponentId):boolean;
    getComponent(id:ComponentId):IComponent;
    get(id:ComponentId):Q.Promise<IService>;
}
