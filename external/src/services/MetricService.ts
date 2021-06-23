import { MetricModel } from '../models/MetricModel';
import { TaskModel, TaskState } from '../models/TaskModel';
import AppService from './AppService';

export class MetricService {
    public static GetTaskMetrics(taskModels: Array<TaskModel>): MetricModel {
        const retObj = {
            teamIds: taskModels.map(d => d.taskedTeamId).filter((f, i, e) => e.indexOf(f) === i).sort(),
            totalTasks: taskModels.length,
            pendingTasks: taskModels.filter(f => f.taskState === TaskState.pending).length,
            workingTasks: taskModels.filter(f => f.taskState === TaskState.working).length,
            completedTasks: taskModels.filter(f => f.taskState === TaskState.complete).length,
            latestSuspense: new Date(Math.max(...taskModels.map(d => new Date(d.taskSuspense).getTime()).filter(f => f))),
            bustedSuspenses: taskModels
                .filter(f => f.taskState !== TaskState.complete)
                .filter(f => new Date().getTime() > new Date(f.taskSuspense).getTime())
                .length > 0,
            data: { team: taskModels.map(d => AppService.AppSettings.teams.reduce((t, n) => n.id === d.taskedTeamId ? n.name : t, null)).filter((f, i, e) => e.indexOf(f) === i) }
            } as MetricModel;

            retObj.earliestStart = ((inVal) => inVal ? new Date(inVal) : null)(taskModels
            .reduce((t, n) => n.taskStart ? t.concat([n.taskStart.getTime()]) : t, []).filter(f => f)
            .sort()[0]);

        retObj.latestFinish = ((inVal) => inVal ? new Date(inVal) : null)(taskModels
            .reduce((t, n) => n.taskFinish ? t.concat([n.taskFinish.getTime()]) : t, []).filter(f => f)
            .sort().reverse()[0]);
        retObj.overallStatus = (stats => stats.length === 1 && stats[0] === TaskState.complete ? TaskState.complete : TaskState.working)(taskModels.map(d => d.taskState).filter((f, i, e) => e.indexOf(f) === i));

        return retObj;
    }
}
