import { Component, Input, OnChanges } from '@angular/core';

import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { CohortMap, Person } from '@lib/models';
import { Statistics } from '@lib/statistics';
import { formatChartPoint } from './tooltip-formatter';

const BASE_BOX_PLOT_OPTIONS = {
  chart: { type: 'boxplot' },
  legend: { enabled: false },
  title: { text: 'Salary Comparison' },
  tooltip: { formatter: formatChartPoint },
  yAxis: { title: { text: 'Salary (£)' } },
};

@Component({
  selector: 'sst-box-plot',
  templateUrl: './box-plot.component.html',
  styleUrls: ['./box-plot.component.scss']
})
export class BoxPlotComponent implements OnChanges {
  @Input() cohorts: CohortMap;
  @Input() people: Person[];

  chartOptions$: Observable<any>;

  private chartOptionSubject: Subject<any>;

  constructor() {
    this.chartOptionSubject = new BehaviorSubject<any>(BASE_BOX_PLOT_OPTIONS);
    this.chartOptions$ = this.chartOptionSubject.asObservable();
  }

  ngOnChanges() {
    this.chartOptionSubject.next(this.createChartOptions(this.people, this.cohorts));
  }

  private createChartOptions(people: Person[], cohorts: CohortMap): any {
    if (!people || !cohorts) {
      return BASE_BOX_PLOT_OPTIONS;
    }

    let { categories, data, outliers } = this.calculateCohortStatistics(people, cohorts);

    let xAxis = { categories, title: { text: 'Cohort' } };
    let series = [{ data }, { type: 'scatter', data: outliers }];

    return Object.assign({}, BASE_BOX_PLOT_OPTIONS, { series, xAxis });
  }

  private calculateCohortStatistics(people: Person[], cohortMap: CohortMap) {
    console.log('calculating statistics for', cohortMap);
    let cohorts = Array.from(Object.keys(cohortMap));
    let data = cohorts.map(key => Statistics.calculateBoxPlotData(cohortMap[key]));

    return {
      categories: cohorts,
      data,
      outliers: Statistics.identifyOutliers(people, data, cohorts),
    };
  }
}
