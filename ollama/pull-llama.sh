#!/bin/bash

ollama serve &

sleep 5

ollama pull tinyllama

wait $!