---
title: Troubleshoot Deployment
---

# Troubleshoot Deployment

This page covers issues that surface only after an integration leaves your machine and runs on WSO2 Cloud, including configuration injected at runtime.

Before you start digging into the deployment layer, confirm the integration runs locally with `bal build && bal run`. If it fails locally, fix the integration first using the other pages in this section. If it works locally but breaks once deployed, the issue is in the deployment environment, and the section below helps you isolate it.

## Configuration in deployed environments

Configurable values are resolved in this priority order (highest to lowest):

1. `BAL_CONFIG_VAR_<VARIABLE_NAME>` environment variables (per-variable override; highest priority).
2. The `BAL_CONFIG_DATA` environment variable (inline TOML).
3. Files listed in `BAL_CONFIG_FILES` (colon-separated on Linux and macOS, semicolon-separated on Windows).
4. `Config.toml` in the working directory.

For sensitive values such as API keys and passwords, prefer injecting each value through a `BAL_CONFIG_VAR_<VARIABLE_NAME>=<value>` environment variable rather than committing them to a file. See [Managing configurations](managing-configurations.md) for how to set these per environment on WSO2 Cloud.

## What's next

- [Logging](../../develop-and-test/troubleshooting/logging.md) - add log statements to trace what the deployed integration is doing.
- [Errors and stack traces](../../develop-and-test/troubleshooting/errors-and-stack-traces.md) - read the error output captured from a deployed integration.
- [Profiling](../../develop-and-test/troubleshooting/profiling.md) - investigate performance issues that only appear under deployed load.
