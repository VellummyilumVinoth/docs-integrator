---
title: Distributed Tracing
---

# Distributed Tracing

Distributed tracing follows a single request end to end as it passes through your integration and the services it calls. Each step is recorded as a **span** with its duration and details, and the spans of one request are grouped into a **trace**. Use traces to see where time is spent, identify latency bottlenecks across service boundaries, and debug request failures.

WSO2 Integrator produces traces using OpenTelemetry. You choose the backend that receives and displays them.

## Enable tracing with Jaeger or Zipkin

:::note Using OpenTelemetry?
The OpenTelemetry extension is set up differently and uses its own sampler options. Follow the [OpenTelemetry](open-source/opentelemetry.md) guide instead.

Tracing needs three things: observability included in the build, the extension for your tracing backend, and the tracing configuration.

### 1. Include observability in the build

Open `Ballerina.toml` and add:

```toml
[build-options]
observabilityIncluded = true
```

### 2. Import the tracing extension

In your entry point file (typically `main.bal`), import the extension for the backend you use. Use one of:

```ballerina
import ballerinax/jaeger as _;
```

```ballerina
import ballerinax/zipkin as _;
```

### 3. Turn tracing on

In `Config.toml`, enable tracing and name the provider (`"jaeger"` or `"zipkin"`):

```toml
[ballerina.observe]
tracingEnabled = true
tracingProvider = "jaeger"
```

Each backend also takes its own connection settings (agent host and port, sampler, and buffering) under `[ballerinax.jaeger]` or `[ballerinax.zipkin]`. Those are covered on the backend's page.

## Sampling with Jaeger and Zipkin

Sampling controls how many requests are traced. Both Jaeger and Zipkin support the same three strategies, set with `samplerType` and `samplerParam`:

| Strategy | Parameter | Description |
|----------|-----------|-------------|
| `const` | `1.0` (on) or `0.0` (off) | Sample all or none |
| `probabilistic` | `0.0` to `1.0` | Probability of sampling each trace |
| `ratelimiting` | traces per second | Fixed rate of traces per second |

Sampling every request is fine for development. In production, use `probabilistic` or `ratelimiting` to reduce overhead while keeping visibility into your system.

If `samplerType` is not one of these values, the extension prints an error at startup and falls back to `const`, which traces every request.

## Choose a tracing backend

| Backend | Best for | Guide |
|---------|----------|-------|
| **Jaeger** | Production-grade distributed tracing | [Jaeger](open-source/jaeger.md) |
| **Zipkin** | A lightweight tracing alternative | [Zipkin](open-source/zipkin.md) |
| **OpenTelemetry** | Any OTLP backend, such as an OpenTelemetry Collector, with traces and metrics from one extension | [OpenTelemetry](open-source/opentelemetry.md) |

To send traces to **AWS X-Ray**, use the Jaeger extension, which exports spans over OTLP gRPC to an [AWS Distro for OpenTelemetry](https://aws-otel.github.io/) (ADOT) collector. Configure the collector's `awsxray` exporter, and run the collector as a sidecar on Amazon ECS or as a DaemonSet on Amazon EKS. [Turn tracing on](#3-turn-tracing-on) with the `jaeger` provider, and point the extension at the collector in `Config.toml`:

```toml
[ballerinax.jaeger]
agentHostname = "localhost"   # the ADOT collector; localhost for an ECS sidecar
agentPort = 4317
```

Set `agentPort` explicitly. The Jaeger extension defaults to port `55680`, not the standard OTLP gRPC port `4317` that the collector listens on.

In a container, where `Config.toml` isn't part of the image, set the same values as environment variables: `BAL_CONFIG_VAR_BALLERINA_OBSERVE_TRACINGENABLED=true`, `BAL_CONFIG_VAR_BALLERINA_OBSERVE_TRACINGPROVIDER=jaeger`, `BAL_CONFIG_VAR_BALLERINAX_JAEGER_AGENTHOSTNAME`, and `BAL_CONFIG_VAR_BALLERINAX_JAEGER_AGENTPORT`.

You can also send traces to a managed platform: [Datadog](commercial/datadog.md) and [New Relic](commercial/new-relic.md) both accept traces, and [Moesif](commercial/moesif.md) supports traces alongside metrics and logs. For a complete stack that includes tracing, see the [Local Development Stack](recipes/local-development-stack.md) and [Kubernetes Production Stack](recipes/kubernetes-production-stack.md) recipes.

## What's next

- [Jaeger](open-source/jaeger.md) — Set up Jaeger and view traces
- [Zipkin](open-source/zipkin.md) — Set up Zipkin and view traces
- [OpenTelemetry](open-source/opentelemetry.md) — Export traces over OTLP to any compatible backend
- [Metrics](metrics.md) — Collect and monitor metrics alongside traces
- [Logging](logging.md) — Configure structured logging
