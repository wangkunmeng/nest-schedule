
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

# Nestjs Schedule

<p align="center">
    <a href="https://www.npmjs.com/~nestjs-schedule" target="_blank"><img src="https://img.shields.io/npm/v/nestjs-schedule.svg" alt="NPM Version"/></a>
    <a href="https://www.npmjs.com/~nestjs-schedule" target="_blank"><img src="https://img.shields.io/npm/l/nestjs-schedule.svg" alt="Package License"/></a>
    <a href="https://www.npmjs.com/~nestjs-schedule" target="_blank"><img src="https://img.shields.io/npm/dm/nestjs-schedule.svg" alt="NPM Downloads"/></a>
</p>

## Description

This is a [Nest](https://github.com/nestjs/nest) module for using decorator schedule jobs.


## Installation

```bash
$ npm i --save nestjs-schedule
```


## Usage

```typescript
import { Module } from '@nestjs/common';
import { ScheduleModule } from 'nestjs-schedule';

@Module({
  imports: [
    ScheduleModule.register(),
  ]
})
export class AppModule {
}
```

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, Interval, Timeout, NestSchedule } from 'nestjs-schedule';

@Injectable() // Only support SINGLETON scope
export class ScheduleService extends NestSchedule {    
  @Cron('0 0 2 * *', {
    startTime: new Date(), 
    endTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
  })
  async cronJob() {
    console.log('executing cron job');
  }
  
  @Timeout(5000)
  onceJob() {
    console.log('executing once job');
  }
  
  @Interval(2000)
  intervalJob() {
    console.log('executing interval job');
    
    // if you want to cancel the job, you should return true;
    return true;
  }
}
```

### Dynamic Schedule Job

```typescript
import { Injectable } from '@nestjs/common';
import { InjectSchedule, Schedule } from 'nestjs-schedule';

@Injectable()
export class ScheduleService {    
  constructor(
    @InjectSchedule() private readonly schedule: Schedule,
  ) {
  }
  
  createJob() {
    // schedule a 2s interval job
    this.schedule.scheduleIntervalJob('my-job', 2000, () => {
      console.log('executing interval job');
    });
  }
  
  cancelJob() {
    this.schedule.cancelJob('my-job');
  }
}
```

### Distributed Support

#### 1. Extend NestDistributedSchedule class

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, NestDistributedSchedule } from 'nestjs-schedule';

@Injectable()
export class ScheduleService extends NestDistributedSchedule {  
  constructor() {
    super();
  }
  
  async tryLock(method: string) {
    if (lockFail) {
      return false;
    }
    
    return () => {
      // Release here.
    }
  }
  
  @Cron('0 0 4 * *')
  async cronJob() {
    console.log('executing cron job');
  }
}
```

#### 2. Use UseLocker decorator

```typescript
import { ILocker, IScheduleConfig, InjectSchedule, Schedule } from 'nestjs-schedule';
import { Injectable } from '@nestjs/common';

// If use NestCloud, it supports dependency injection.
@Injectable()
export class MyLocker implements ILocker {
  private key: string;
  private config: IScheduleConfig;

  constructor(
    @InjectSchedule() private readonly schedule: Schedule,
  ) {
  }

  init(key: string, config: IScheduleConfig): void {
    this.key = key;
    this.config = config;
    console.log('init my locker: ', key, config);
  }

  release(): any {
    console.log('release my locker');
  }

  tryLock(): Promise<boolean> | boolean {
    console.log('apply my locker');
    return true;
  }
}
```

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, NestSchedule, UseLocker } from 'nestjs-schedule';
import { MyLocker } from './my.locker';

@Injectable()
export class ScheduleService extends NestSchedule {  
  @Cron('0 0 4 * *')
  @UseLocker(MyLocker)
  async cronJob() {
    console.log('executing cron job');
  }
}
```


## API

### class ScheduleModule

#### static register\(config: IGlobalConfig\): DynamicModule

Register schedule module.

| field | type | required | description |
| --- | --- | --- | --- |
| config.enable | boolean | false | default is true, when false, the job will not execute |
| config.maxRetry | number | false |  the max retry count, default is -1 not retry |
| config.retryInterval | number | false | the retry interval, default is 5000 |
| config.waiting | boolean | false | the scheduler will not schedule job when this job is running, if waiting is true |

### class Schedule

#### scheduleCronJob(key: string, cron: string, callback: JobCallback, config?: ICronJobConfig)

Schedule a cron job.

| field | type | required | description |
| --- | --- | --- | --- |
| key | string | true | The unique job key |
| cron | string | true | The cron expression |
| callback | () => Promise&lt;boolean&gt; | boolean | If return true in callback function, the schedule will cancel this job immediately |
| config.startTime | Date | false | The start time of this job |
| config.endTime | Date | false | The end time of this job |
| config.enable | boolean | false | default is true, when false, the job will not execute |
| config.maxRetry | number | false |  the max retry count, default is -1 not retry |
| config.retryInterval | number | false | the retry interval, default is 5000 |
| config.waiting | boolean | false | the scheduler will not schedule job when this job is running, if waiting is true |
| config.immediate | boolean | false | running job immediately |

#### scheduleIntervalJob(key: string, interval: number, callback: JobCallback, config?: IJobConfig)

Schedule a interval job.

| field | type | required | description |
| --- | --- | --- | --- |
| key | string | true | The unique job key |
| interval | number | true | milliseconds |
| callback | () => Promise&lt;boolean&gt; | boolean | If return true in callback function, the schedule will cancel this job immediately |
| config.enable | boolean | false | default is true, when false, the job will not execute |
| config.maxRetry | number | false |  the max retry count, default is -1 not retry |
| config.retryInterval | number | false | the retry interval, default is 5000 |
| config.waiting | boolean | false | the scheduler will not schedule job when this job is running, if waiting is true |
| config.immediate | boolean | false | running job immediately |

#### scheduleTimeoutJob(key: string, timeout: number, callback: JobCallback, config?: IJobConfig)

Schedule a timeout job.

| field | type | required | description |
| --- | --- | --- | --- |
| key | string | true | The unique job key |
| timeout | number | true | milliseconds |
| callback | () => Promise&lt;boolean&gt; | boolean | If return true in callback function, the schedule will cancel this job immediately |
| config.enable | boolean | false | default is true, when false, the job will not execute |
| config.maxRetry | number | false |  the max retry count, default is -1 not retry |
| config.retryInterval | number | false | the retry interval, default is 5000 |
| config.immediate | boolean | false | running job immediately |

#### cancelJob(key: string)

Cancel job.


## Decorators

### Cron(expression: string, config?: ICronJobConfig): MethodDecorator

Schedule a cron job.

| field | type | required | description |
| --- | --- | --- | --- |
| expression | string | true | the cron expression |
| config.key | string | false | The unique job key |
| config.startTime | Date | false | the job's start time |
| config.endTime | Date | false | the job's end time |
| config.enable | boolean | false | default is true, when false, the job will not execute |
| config.maxRetry | number | false |  the max retry count, default is -1 not retry |
| config.retryInterval | number | false | the retry interval, default is 5000 |
| config.waiting | boolean | false | the scheduler will not schedule job when this job is running, if waiting is true |
| config.immediate | boolean | false | running job immediately |

### Interval(milliseconds: number, config?: IJobConfig): MethodDecorator

Schedule a interval job.

| field | type | required | description |
| --- | --- | --- | --- |
| milliseconds | number | true | milliseconds |
| config.key | string | false | The unique job key |
| config.enable | boolean | false | default is true, when false, the job will not execute |
| config.maxRetry | number | false |  the max retry count, default is -1 not retry |
| config.retryInterval | number | false | the retry interval, default is 5000 |
| config.waiting | boolean | false | the scheduler will not schedule job when this job is running, if waiting is true |
| config.immediate | boolean | false | running job immediately |

### Timeout(milliseconds: number, config?: IJobConfig): MethodDecorator

Schedule a timeout job.

| field | type | required | description |
| --- | --- | --- | --- |
| milliseconds | number | true | milliseconds |
| config.key | string | false | The unique job key |
| config.enable | boolean | false | default is true, when false, the job will not execute |
| config.maxRetry | number | false |  the max retry count, default is -1 not retry |
| config.retryInterval | number | false | the retry interval, default is 5000 |
| config.immediate | boolean | false | running job immediately |

### InjectSchedule(): PropertyDecorator

Inject Schedule instance

### UseLocker(locker: ILocker | Function): MethodDecorator

Make your job support distribution.
 
If you use [NestCloud](https://github.com/nest-cloud/nestcloud), the Locker will support dependency injection, or not use injection please.


## Stay in touch

- Author - [miaowing](https://github.com/miaowing)

## License

- NestSchedule is [MIT licensed](LICENSE).
