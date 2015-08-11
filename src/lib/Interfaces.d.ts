/**
 * Created by y.evtushenko on 07.08.15.
 */

declare type Service = any;
declare type ComponentId = string;
//declare type DependencyId = string;
declare type IFactory = Function;

declare type IFactoryWrapper = (Factory) => IFactory

interface IOptions {
    get(path:string):any;
}

interface IInjectionMap {
    intoConstructor?:Object
    intoInstance?:Object
}

interface IComponentOptions {
    id:ComponentId;
    func:Function;
    dependencies?:ComponentId[];
    inject?: IInjectionMap;
}

interface IComponent {
    getService(dependantServices?:Service[]):Q.Promise<Service>;
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
    get(id:ComponentId):Q.Promise<Service>;
}
