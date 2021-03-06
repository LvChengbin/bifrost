# Bifrost

Providing a http server and client that used to transfer files between remote server and local system.


<!-- vim-markdown-toc GFM -->

* [Start](#start)
* [Usage](#usage)
    * [Bifrost Server](#bifrost-server)
        * [biforst server start \[ \-\-port \] \[ \-\-config \]](#biforst-server-start----port-----config-)
        * [bifrost server status](#bifrost-server-status)
        * [bifrost server stop](#bifrost-server-stop)
        * [bifrost server restart](#bifrost-server-restart)
    * [Bifrost Client](#bifrost-client)
        * [bifrost send local host:target](#bifrost-send-local-hosttarget)
        * [bifrost get host:file [target]](#bifrost-get-hostfile-target)
    * [Bifrost Cli](#bifrost-cli)
        * [bifrost clean](#bifrost-clean)
    * [.bifrost.js](#bifrostjs)

<!-- vim-markdown-toc -->

## Start

`Bifrost` should be installed both on remote server and the local system.

```sh
$ npm i -g @lvchengbin/bifrost
```

On the remote server, a bifrost server can be started with running:

```sh
$ bifrost server start --port=3100
```
By running the cmd above, `bifrost` would try looking for the `~/.bifrost.js` file, and if `--port` is specfied, it will overwrite the port written in `~/.bifrost.js`. For more information about the `.bifrost.js`, see [.bifrost.js](#bifrostjs)

## Usage

### Bifrost Server

While using bifrost server, the base dir is set to the home dir of current user, that means all relative path will be resolved with the home dir, including the path "~".

#### biforst server start \[ \-\-port \] \[ \-\-config \]
> to start a server.

```sh
$ bifrost server start
✔ server is started on port 3200
```

#### bifrost server status
> show running status of bifrost server.

```sh
$ bifrost server status
bifrost server is running:
 Port: 3200
 Pid: 57908
 Config: /Users/lvchengbin/.bifrost.js
```

#### bifrost server stop 
> to stop the running bifrost server.

```sh
$ bifrost server stop
✔ stopping bifrost server...done!
```

#### bifrost server restart 
> to stop and restart the running bifrost server.

```sh
$ bifrost server restart
✔ stopping bifrost server...done!
✔ server is started on port 3200
```

### Bifrost Client

#### bifrost send local host:target
> to send a file from local system to the remote server.

```sh
$ bifrost send test.txt 127.0.0.1:3200:~
✔ md5: d41d8cd98f00b204e9800998ecf8427e
✔ finish sending test.txt to http://127.0.0.1:3200.
```
and you can set an alias for the remote server `127.0.0.1:3000` in `.bifrost.js`:

```sh
$ bifrost send test.txt local:3200:~
✔ md5: d41d8cd98f00b204e9800998ecf8427e
✔ finish sending test.txt to http://127.0.0.1:3200.
```
if you are sending a dir, it would be packed before sending:

```sh
$ bifrost send test local:~
✔ packing files...done!
✔ md5: 61e452a833e06bae7672322569a221ad
✔ finish sending test to http://127.0.0.1:3200.
```

#### bifrost get host:file [target]
> to get a file or dir from remote server

```sh
$ bifrost get local:test.txt
✔ finish getting test.txt from http://127.0.0.1:3200.
✔ checking file with md5: d41d8cd98f00b204e9800998ecf8427e...passed!
```

### Bifrost Cli

#### bifrost clean
> this command will clean all tmp files generated by bifrost.

### .bifrost.js
```js
module.exports = {
    server : {
        port : 3200
    },
    client : {
        servers : {
            local : {
                host : '127.0.0.1:3200'
            }
        } 
    }
};
```
