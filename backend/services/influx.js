const { InfluxDB } = require('@influxdata/influxdb-client');

const influxDB = new InfluxDB({
  url: process.env.INFLUXDB_URL,
  token: process.env.INFLUXDB_TOKEN,
});

const queryApi = influxDB.getQueryApi(process.env.INFLUXDB_ORG);

// Pobierz ostatnie metryki Proxmox (CPU, RAM, dysk, sieć)
async function getProxmoxMetrics() {
  const query = `
    from(bucket: "${process.env.INFLUXDB_BUCKET}")
      |> range(start: -5m)
      |> filter(fn: (r) => r["_measurement"] == "proxmox")
      |> last()
  `;

  const result = [];
  
  for await (const { values, tableMeta } of queryApi.iterateRows(query)) {
    const row = tableMeta.toObject(values);
    result.push(row);
  }

  return result;
}

// Pobierz status kontenerów Docker
async function getDockerMetrics() {
  const query = `
    from(bucket: "${process.env.INFLUXDB_BUCKET}")
      |> range(start: -5m)
      |> filter(fn: (r) => r["_measurement"] == "docker_container_status")
      |> last()
  `;

  const result = [];
  
  for await (const { values, tableMeta } of queryApi.iterateRows(query)) {
    const row = tableMeta.toObject(values);
    result.push(row);
  }

  return result;
}

module.exports = {
  getProxmoxMetrics,
  getDockerMetrics,
};