# JouleDuel

An energy-efficient coding competition platform where users solve programming challenges and compete based on the energy consumption of their solutions.

## Features

- **LeetCode-style problems**: Solve algorithmic challenges.
- **Energy measurement**: Solutions are benchmarked using PowerJoular to measure CPU energy consumption
- **Leaderboard**: Compete with others based on energy efficiency.
- **Code validation**: Solutions are validated in a sandboxed environment before energy measurement

## Prerequisites

### Requirements

- [PowerJoular](https://github.com/joular/powerjoular.git) to be available as `/usr/bin/powerjoular`.
  
  The following is for Arch Linux.
  ```shell
  git clone https://github.com/joular/powerjoular
  cd powerjoular
  sudo pacman -S gcc-ada
  mkdir -p obj
  cd obj
  gnatmake ../src/powerjoular.adb
  sudo cp powerjoular /usr/bin
  ```
- pnpm (`npm install -g pnpm`)
- Docker & Docker Compose

### Sudoers Configuration

The app needs passwordless sudo for PowerJoular and process management:

```bash
sudo visudo -f /etc/sudoers.d/jouleduel
```

Add (replace `youruser` with your username):
```
youruser ALL=(ALL) NOPASSWD: /usr/bin/powerjoular
youruser ALL=(ALL) NOPASSWD: /usr/bin/kill
youruser ALL=(ALL) NOPASSWD: /usr/bin/rm
```

Verify:
```bash
sudo -n powerjoular -h
sudo -n kill -l
sudo -n rm --help
```

If any of the above return an error then passwordless sudo isn't correctly configured.

## Installation

Clone the repository

```bash
git clone https://github.com/wmarcu/cs4575-p2-code.git
cd cs4575-p2-code
```

Install dependencies

```bash
pnpm install
```

Configure the environment

```bash
cp env-example.txt .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/mydb

# Optional configuration
PISTON_URL=http://localhost:2000           # Piston API URL
ENERGY_MEASUREMENT_RUNS=10                  # Number of measurement runs
ENERGY_WARMUP_RUNS=3                        # Warmup runs (discarded)
ENERGY_MIN_DURATION_SEC=3                   # Minimum duration per run
ENERGY_BASELINE_SEC=2                       # Baseline measurement duration
ENERGY_CPU=                                 # CPU to pin execution to (optional)
POWERJOULAR_PATH=/usr/bin/powerjoular       # Path to PowerJoular
PYTHON_PATH=python3                         # Python interpreter
EXECUTION_TIMEOUT_MS=30000                  # Code execution timeout
```

### Start Docker services

```bash
cd docker
docker compose up -d
```

This starts:
- PostgreSQL on port 5432
- Piston on port 2000

Wait for Piston to install Python:
```bash
docker logs -f docker-piston-post-setup-1
```

If the automatic installation fails it is a DNS issue, fix by adding the following to `/etc/docker/daemon.json`:
```json
{
  "dns": ["8.8.8.8", "1.1.1.1"]
}
```

Then restart docker with `sudo systemctl restart docker`
### Database setup

```bash
pnpm db:push
pnpm db:seed
```

### Build and run

```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

## CPU Isolation (Optional)

For more accurate energy measurements, isolate a CPU core by editing the kernel parameters of your bootloader, for example if using "systemd-boot" modify your kernel's boot entry, e.g `sudo nano /boot/loader/entries/2024-09-29_21-30-17_linux.conf` and add the following kernel parameters at the end of the "options" line:

```
isolcpus=3 nohz_full=3 rcu_nocbs=3
```

Then reboot.

To run the app in isolation mode add `ENERGY_CPU=3` in your `.env` file, or simply run `ENERGY_CPU=3 pnpm run dev`


## How Energy Measurement Works

1. **Validation**: Code is first validated against test cases using Piston
2. **Baseline**: System idle power is measured for 2 seconds
3. **Warmup**: 3 warmup runs are performed and discarded (eliminates JIT/cache effects)
4. **Measurement**: 10 measurement runs are performed:
   - PowerJoular monitors system-wide CPU power
   - The solution is executed in a loop for minimum 3 seconds
   - Energy consumption is recorded per run
5. **Calculation**:
   - Baseline power is subtracted from each measurement
   - Median energy is computed.
   - Result is expressed as microjoules per iteration (uJ/iter)