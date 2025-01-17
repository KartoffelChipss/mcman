<div align="center">

# Minecraft Server Manager

A Minecraft CLI app to quickly install and manage Minecraft servers

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/github/package-json/v/KartoffelChipss/mcman)](https://github.com/KartoffelChipss/mcman)

</div>

## 🚀 Features

- **Quick interactive server setup**: Quickly set up Minecraft servers with specific versions and configurations
- **Customizable Server Configurations**: Specify memory allocation, server ports, and online modes
- **Server List Management**: Save, list, and remove server configurations for easy reusability

## 📦 Installation

```bash
npm install -g mc-manager
```

## 📋 Commands

### `init`

Initialize a new project with a specific Minecraft version.

```bash
mcman init [path] [options]
```

**Options**:

- `-v, --mc-version <version>`: Specify the Minecraft version.
- `-b, --build <build>`: Specify the build to download.
- `-e, --accept-eula`: Accept the Minecraft EULA.
- `-p, --port <port>`: Specify the port to run the server on.
- `-o, --online-mode`: Enable online mode.

**Example**:

```bash
mcman init ./myserver -v 1.20.1 -e -p 25565 -o
```

---

### `start`

Start a server.

```bash
mcman start [name] [options]
```

**Options**:

- `--flags <flags>`: Specify the Java flags to use.
- `--gui`: Open the server gui.
- `-m, --memory <memory>`: Specify the amount of memory to allocate.

**Example**:

```bash
mcman start myserver -m 4G --gui
```

---

### `save`

Save the current directory as a server.

```bash
mcman save [path] [options]
```

**Options**:

- `-n, --name <name>`: Specify the name of the server.

**Example**:

```bash
mcman save ./myserver -n myserver
```

---

### `ls` (alias: `list`)

List all saved servers.

```bash
mcman ls
```

**Example**:

```bash
mcman ls
```

---

### `rm`

Remove a saved server.

```bash
mcman rm <name>
```

**Example**:

```bash
mcman rm myserver
```

---

### `config`

Open the configuration file in the default editor.

```bash
mcman config
```

**Example**:

```bash
mcman config
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
