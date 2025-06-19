#!/bin/sh
export INSTANCE_ID="node-$(hostname)"
exec "$@"