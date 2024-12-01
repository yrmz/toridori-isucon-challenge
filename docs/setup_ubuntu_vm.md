# GCP で作成した Ubuntu, 20.04 LTS amd64 のVMに上で動作させるメモ

install packages

```bash
sudo apt update
sudo apt install git make unzip bzip2 cpulimit
```

create user

```bash
sudo adduser app
sudo gpasswd -a app sudo
```

install nodejs to root

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

setup mysql

```bash
sudo apt install mysql-server
sudo systemctl enable mysql
sudo systemctl status mysql
```

modify mysql memory limit

```bash
sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf

# add below config
#innodb_buffer_pool_size = 6G
#innodb_log_buffer_size = 64M

sudo systemctl restart mysql
```

enter mysql console with below command

```bash
sudo mysql
```

create database

```sql
CREATE DATABASE isuconp;

-- add privileges 
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON isuconp.* TO 'root'@'localhost';

-- flush and exit
FLUSH PRIVILEGES;
exit;
```

## setup on app user

switch to app user

```bash
su app
cd ~
```

install asdf

```bash
git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.13.1
echo -e "\n. $HOME/.asdf/asdf.sh" >> ~/.bashrc
echo -e '\n. $HOME/.asdf/completions/asdf.bash' >> ~/.bashrc
source ~/.bashrc

asdf plugin add nodejs
asdf plugin add pnpm
```

clone repository

```bash
git clone https://github.com/kit-tech-jp/toridori-isucon-challenge.git
cd toridori-isucon-challenge/

# initial install
asdf install
pnpm install
```

setup repo

```bash
make init

# modify .env and change mysql port to 3306
vim .env

# insert seed data
bunzip2 -c data/dump.sql.bz2 | mysql -uroot -ppassword -h127.0.0.1 -P3306 isuconp
```

build app

```bash
pnpm run prisma:generate
pnpm run build
```

setup golang

```bash
wget https://go.dev/dl/go1.23.4.linux-amd64.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.23.4.linux-amd64.tar.gz
echo "export PATH=$PATH:/usr/local/go/bin" >> ~/.bashrc
echo "export GOPATH=$HOME/go" >> ~/.bashrc echo "export PATH=$PATH:$GOPATH/bin" >> ~/.bashrc
mkdir -p ~/go/{bin,src,pkg}
source ~/.bashrc
```

build benchmarker

```bash
cd benchmarker/
make
```

## run

run app

```bash
su app
cd ~/toridori-isucon-challenge

sudo touch /var/log/app.log
sudo chmod 666 /var/log/app.log

sudo NODE_ENV=production node --max-old-space-size=2048 dist/main.js

# or you can run in background
sudo NODE_ENV=production node --max-old-space-size=2048 dist/main.js > /var/log/app.log 2>&1 &
```

run benchmarker

```bash
su app
cd ~/toridori-isucon-challenge/benchmarker
./bin/benchmarker -t "http://127.0.0.1" -u ./userdata
```

## setup ssh from your local

create key pair

```bash
ssh-keygen -f ./toridori-isuconp
```

add pubkey to your vm

```bash
su app
cd ~
cat toridori-isuconp.pub > ~/.ssh/authorized_keys
```

> Caution: If you manage SSH keys in metadata, you might disrupt the ability of your project members to connect to VMs. Additionally, you risk granting users, including users outside of your project, unintended access to VMs. Users and service accounts that have the ability to modify project metadata can add SSH keys for all VMs in the project except for VMs that block project-level SSH keys. For more information, see risks of manual key management.


```bash
ssh -i ./toridori-isuconp app@<vm ip>
```
