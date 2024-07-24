#! /usr/bin/bash
echo "hello world"
cd ./api &
dotnet watch run &
cd .. &
cd ./ToDatabase
dotnet watch run &
cd .. &
cd ./Worker &
dotnet watch run &