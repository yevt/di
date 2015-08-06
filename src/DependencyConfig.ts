/**
 * Created by y.evtushenko on 06.08.15.
 */
interface DependencyConfig {
    id:string;
    func:Function;
    dependencies?:(string[]);
}