import React, { Component } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-moment';

class CovidChart extends Component {
  chartRef = React.createRef();
  chart = null;

  componentDidMount() {
    this.buildChart();
  }

  componentDidUpdate() {
    this.updateChart();
  }

  buildChart() {
    const { data } = this.props;

    const chartConfig = {
        type: 'line', // или другой тип графика
        data: {
          labels: data.labels, // Метки для оси X
          datasets: [
            {
              label: 'Количество случаев',
              data: data.casesData, // Данные для количества случаев
              borderColor: 'rgba(75, 192, 192, 1)', // Цвет линии
            },
            {
              label: 'Количество смертей',
              data: data.deathsData, // Данные для количества смертей
              borderColor: 'rgba(255, 99, 132, 1)', // Цвет линии
            },
          ],
        },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'month', // Определите желаемую единицу времени (например, 'day', 'week', 'month', 'year')
              displayFormats: {
                month: 'MMM YYYY', // Формат отображения месяца
              },
            },
            title: {
              display: true,
              text: 'Дата',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Количество случаев',
            },
          },
        },
      },
    };

    if (this.chart) this.chart.destroy();
    const ctx = this.chartRef.current.getContext('2d');
    this.chart = new Chart(ctx, chartConfig);
  }

  updateChart() {
    const { data } = this.props;

    // Обновите данные диаграммы при изменении props
    this.chart.data.labels = data.labels;
    this.chart.data.datasets[0].data = data.casesData;
    this.chart.data.datasets[1].data = data.deathsData;
    this.chart.update();
  }

  render() {
    return <canvas ref={this.chartRef} />;
  }
}

export default CovidChart;
