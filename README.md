# Graph Workloads

[![CircleCI](https://circleci.com/gh/moxious/graph-workload.svg?style=svg)](https://circleci.com/gh/moxious/graph-workload)

Tools for generating workloads on Neo4j.

I use this for benchmarking and load testing Neo4j instances.  It provides a framework where you 
can either design your own mixed read/write workload from strategies provided, or design your own
reads/writes to execute against a database, while keeping track of execution stats.

You can run workloads timed (i.e. for 5,000 ms) or numbered (i.e. 5,000 runs).  

# Usage

```
Usage: run-workload.js -p password
   [-a address]
   [-u username]
   [-n hits] how many total queries to run
   [--ms milliseconds] how many milliseconds to test for
   [--workload /path/to/workload.json] probability table spec
   [--query CYPHER_QUERY] single cypher query to run
   [--schema /path/to/schema.json] schema for generated records (only used with
   --query)
   [--batchsize [1000]] number of records from schema to generate per batch
   [--concurrency c] how many concurrent queries to run (default: 10)
   [--checkpoint cn] how often to print results in milliseconds (default: 5000)
   [--fail-fast] if specified, the work will stop after encountering one
   failure.

You may only specify one of the options --n or --ms.
You may only specify one of the options --workload or --query


Options:
  --help         Show help                                             [boolean]
  --version      Show version number                                   [boolean]
  -a             address to connect to                    [default: "localhost"]
  -u             username                                     [default: "neo4j"]
  -p             password                                             [required]
  -d             database
  --schema       batch schema file
  --batchsize    number of records per batch, usable only with schema
  -n             number of hits on the database
  --ms           number of milliseconds to execute
  --workload     absolute path to JSON probability table/workload
  --query        Cypher query to run
  --concurrency                                                    [default: 10]
  --checkpoint                                                   [default: 5000]

Examples:
  run-workload.js -a localhost -u neo4j -p  Run 10 hits on the local database
  secret -n 10
```

# Run in Docker

Simply pass any arguments the command recognizes to the docker container.

```
docker run --tty --interactive mdavidallen/graph-workload:latest -a my-neo4j-host.com -u neo4j -p password 2>&1
```

# Running Stand-Alone from Source

```
yarn install
node src/run-workload.js -a localhost -u neo4j -p password
```

See the `workloads` directory for the format of the probability table.

You can use the script `npm run graph-workload` as a synonym for running the index.js file, but keep in mind npm requires an extra `--` argument prior to passing
program arguments, as in, `npm run graph-workload -- --n 20`

# Examples

## Create a lot of nodes as fast as possible:

```
npm run graph-workload -- -a localhost -u neo4j -p admin --query 'Unwind range(1,1000000) as id create (n);' -n 50 --concurrency 4
```

## Write custom data generated in batches 

Fake/mock data can be generated with functions from [fakerjs](https://www.npmjs.com/package/faker).

Using this technique you can generate your own data and create
custom load patterns.  Similar to other Neo4j utilities, the batch will be present in the query form: "UNWIND batch AS event".

```
npm run graph-workload -- -a localhost -u neo4j -p admin \
  --query 'CREATE (t:Test) SET t += event' \
  --batchsize 1000 \
  --schema /absolute/path/to/schemas/myschema.json
```

See `src/schemas/user.json` as an example of a schema you can use in this way.  Keys are field names to generate, values are the faker functions used to populate that field.

## Explicit Transactions

If you use the `--query` option, you may also use `--mode READ` or `WRITE`.  This enables the program
to use explicit read or write transactions, so that when queries are sent to a cluster, they are routed
appropriately according to the Neo4j routing rules.

# Neo4j 4.0 / Multidatabase

As of Neo4j 4.0, sessions support multi-database.  Use the `-d` or `--database` argument to direct
where the workload should go.  By default, the workload goes to the default database (usually `neo4j`).

Example:

```
npm run graph-workload -- -a neo4j://my-cluster -u neo4j -p admin -d mydb
```

# Tests

```
yarn run test
```

# Building Graph Workloads as a Docker Container

```
docker build -t mdavidallen/graph-workload:latest -f Dockerfile . 
```

# Defining your own Custom Workload

- Stress tester has a number of 'read strategies' and 'write strategies'
- There is a probability table; the stress tester rolls random numbers and picks a strategy
based on the probability table.
- By tweaking which strategies are available and what their probability is,  you can generate
whichever kind of load you like
- You can write a new strategy to simulate any specific kind of load you like.

See workload.js for details.