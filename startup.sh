#!/bin/bash

nohup node ./WEB_local/app.js &
fg
nohup node ./WEB_portal/app.js &
fg