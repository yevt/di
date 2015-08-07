/**
 * Created by y.evtushenko on 07.08.15.
 */

declare type Service = any;
declare type ComponentId = string;

interface IContext {
    destroy();
    registerComponent(options:IContextOptions);
    hasComponent(id:ComponentId):boolean;
    get(id:ComponentId):Q.Promise<Service>;
}

interface IComponent {
    //new(options:IComponentOptions):Component
    getService(dependantServices:Service[]):Q.Promise<Service>;
    getOptions():IComponentOptions;
}

interface IContextOptions {

}

interface IComponentOptions {
    id:ComponentId;
    func:Function;
    dependencies?:ComponentId[];
}


