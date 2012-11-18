# Reload My Tab

A system for reloading a Firefox tab seamlessly while coding.

Requirements:

* UNIX-ish OS ( Windows patches welcome )
* node.js
* a recent version of Firefox ( tested on Nightly )

Install:

* copy the `watch` script to a folder on your path
* in sublime text 2, create a new build script like this:

    cat web.sublime-build 
    {
        "cmd": ["touch", ".watchfile"]
    }

Synopsis:

* in a terminal cd to the directory of your web app and run the included watch script
* while editing in ST2, hit Command+B to run the build script
* watch, amazed(!) as the app you are working on is either opened or refreshed each time you invoke the build

Oddities:

* for some reason, when editing css files the refresh is triggered on file *save*. weird.

