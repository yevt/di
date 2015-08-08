/**
 * Created by y.evtushenko on 07.08.15.
 */

declare type Service = any;
declare type ComponentId = string;
declare type DependencyId = string;

interface IOptions {
    get(path:string):any;
}

interface IInjectionMap {
    intoConstructor?: any | any[]
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
    components: IComponentOptions[];
}

interface IContext {
    destroy();
    registerComponent(options:IComponentOptions);
    hasComponent(id:ComponentId):boolean;
    get(id:ComponentId):Q.Promise<Service>;
}

