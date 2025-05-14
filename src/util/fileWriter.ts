import * as path from 'path';
import * as fs from 'fs';
import { logFormatted } from './formatter';

export const writeEulaFile = async (
    workingDir: string,
    acceptEula: boolean
) => {
    const eulaPath = path.resolve(workingDir, 'eula.txt');
    const eulaContent = `eula=${acceptEula ? 'true' : 'false'}`;

    try {
        await fs.promises.writeFile(eulaPath, eulaContent);
    } catch (error) {
        logFormatted(`&cFailed to write eula.txt: ${error}`);
    }
};

export const writePropertiesFile = async (
    workingDir: string,
    port: number,
    onlineMode: boolean
) => {
    const serverPropertiesPath = path.resolve(workingDir, 'server.properties');
    const workingDirName = path.basename(workingDir);

    const propertiesContent = `accepts-transfers=false
allow-flight=false
allow-nether=true
broadcast-console-to-ops=true
broadcast-rcon-to-ops=true
bug-report-link=
debug=false
difficulty=easy
enable-command-block=false
enable-jmx-monitoring=false
enable-query=false
enable-rcon=false
enable-status=true
enforce-secure-profile=true
enforce-whitelist=false
entity-broadcast-range-percentage=100
force-gamemode=false
function-permission-level=2
gamemode=survival
generate-structures=true
generator-settings={}
hardcore=false
hide-online-players=false
initial-disabled-packs=
initial-enabled-packs=vanilla
level-name=world
level-seed=
level-type=minecraft\:normal
log-ips=true
max-chained-neighbor-updates=1000000
max-players=20
max-tick-time=60000
max-world-size=29999984
motd=A Minecraft Server
network-compression-threshold=256
online-mode=${onlineMode}
op-permission-level=4
player-idle-timeout=0
prevent-proxy-connections=false
pvp=true
query.port=25565
rate-limit=0
rcon.password=
rcon.port=25575
region-file-compression=deflate
require-resource-pack=false
resource-pack=
resource-pack-id=
resource-pack-prompt=
resource-pack-sha1=
server-ip=
server-name=${workingDirName}
server-port=${port}
simulation-distance=10
spawn-animals=true
spawn-monsters=true
spawn-npcs=true
spawn-protection=0
sync-chunk-writes=true
text-filtering-config=
use-native-transport=true
view-distance=10
white-list=false`;

    try {
        await fs.promises.writeFile(serverPropertiesPath, propertiesContent);
    } catch (error) {
        logFormatted(`&cFailed to write server.properties: ${error}`);
    }
};

export const writeWaterfallConfig = async (
    workingDir: string,
    port: string
) => {
    const eulaPath = path.resolve(workingDir, 'config.yml');
    const eulaContent = `groups:
  md_5:
  - admin
disabled_commands:
- disabledcommandhere
timeout: 30000
online_mode: true
reject_transfers: false
servers:
  lobby:
    motd: '&1Just another Waterfall - Forced Host'
    address: localhost:25565
    restricted: false
server_connect_timeout: 5000
listeners:
- query_port: ${port}
  motd: '&1Another Bungee server'
  tab_list: GLOBAL_PING
  query_enabled: false
  proxy_protocol: false
  forced_hosts:
    pvp.md-5.net: pvp
  ping_passthrough: false
  priorities:
  - lobby
  bind_local_address: true
  host: 0.0.0.0:${port}
  max_players: 1
  tab_size: 60
  force_default_server: false
stats: 3d6eeeff-f822-4c0a-9cff-7e625c4496e2
network_compression_threshold: 256
log_pings: true
permissions:
  default:
  - bungeecord.command.server
  - bungeecord.command.list
  admin:
  - bungeecord.command.alert
  - bungeecord.command.end
  - bungeecord.command.ip
  - bungeecord.command.reload
  - bungeecord.command.kick
  - bungeecord.command.send
  - bungeecord.command.find
ip_forward: false
player_limit: -1
log_commands: false
connection_throttle_limit: 3
connection_throttle: 4000
enforce_secure_profile: false
prevent_proxy_connections: false
remote_ping_timeout: 5000
forge_support: true
remote_ping_cache: -1
max_packets_per_second: 4096
max_packets_data_per_second: 33554432`;

    try {
        await fs.promises.writeFile(eulaPath, eulaContent);
    } catch (error) {
        logFormatted(`&cFailed to write config.yml: ${error}`);
    }
};
