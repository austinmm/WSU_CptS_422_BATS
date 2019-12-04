red=`tput setaf 1`
green=`tput setaf 2`
yellow=`tput setaf 3`
blue=`tput setaf 4`
color=`tput setaf 6`
reset=`tput sgr0`

#helper functions
#Downloading node packages for template
download_packages () {
  echo "${yellow}Attempting to install necessary packages ...${reset}"
  npm install express --save
  npm install moment --save
  npm install body-parser --save
  npm install path --save
  npm install cookie-parser --save
  npm install mysql --save
  npm install mocha --save
  npm install chai --save
  npm install sinon --save
  npm install chai-http --save
}

mysql_instr () {
  echo "${yellow}Some startup commands to get mysql going: ${reset}"
  echo "${yellow}*Note your mysql default user: root    and no password${reset}"
  echo "${yellow}1. mysql -u root ${reset}"
  echo "( ON FIRST TIME RUN )  ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';"
  echo "${yellow}2. CREATE DATABASE firstDB; (Only do this on your first time)${reset}"
  echo "${yellow}3. USE firstDB; ${reset}"
  echo "${yellow}4. CREATE TABLE accounts ( ${reset}"
  echo "${yellow}      id              INT unsigned NOT NULL AUTO_INCREMENT,${reset}"
  echo "${yellow}      username            VARCHAR(150) NOT NULL,   ${reset}"
  echo "${yellow}      password           VARCHAR(150) NOT NULL,  ${reset}"
  echo "${yellow}      PRIMARY KEY     (id)   ${reset}"
  echo "${yellow} );   #(Only do this on your first time! also you can copy and paste)${reset}"
  echo
  echo "${yellow}5. SHOW TABLES${reset}"
  echo "${yellow}6. exit ${reset}"
  echo "${red}To exit mysql type   exit   ${reset}"
  echo "${reset}Once the table is setup, run the server to check that the server connects to our database${reset}"
}

#check for fixing repo
if [[ $* == *--fix* ]]; then
    echo "${green}Fixing repo setup!${reset}"
    cd ..
    rm -rf nodejs-template
    git clone https://github.com/nikokent/nodejs-template.git
    exit 1
fi

#setup mongo
if [[ $* == *--mongo* ]]; then
    if ! [ -x "$(command -v mongo)" ]; then
      echo "${green}Downloading mongodb!${reset}"
      brew install mongodb
    fi
    echo "${green}Running mongodb as background service!${reset}"
    brew services start mongodb
    exit 1
fi

#setup mysql
if [[ $* == *--mysql* ]]; then
    if ! [ -x "$(command -v mysql)" ]; then
      echo "${green}Downloading mysql!${reset}"
      brew install mysql
    fi
    echo "${green}Running mysql as background service!${reset}"
    brew services start mysql
    mysql_instr
    exit 1
fi

if [ -f "package.json" ]; then
  echo "${green}Looks like template has been built already!${reset}"
  echo "Running ${yellow}node app.js${reset}"
  if ! [ -x "$(command -v firefox)" ]; then
    firefox localhost:3000
  fi
  node app.js
  exit 1
fi

#check for requirements
if ! [ -x "$(command -v node)" ]; then
  if ! [ -x "$(command -v apt-get)" ]; then
    if ! [ -x "$(command -v brew)" ]; then  
      echo "${red}Node is not installed. Please visit https://nodejs.org/en/ and install to continue! >&2${reset}"
      echo "If youre on macOS type the following command into terminal > ${yellow}/usr/bin/ruby -e \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)\"${reset}"
      exit 1
    else
      echo 'Attempting to install node and npm!'
      brew install node
      echo "${green}Node is installed [✓]${reset}"
    fi
  else  
    echo "${yellow}Attempting to install node and npm${reset}"
    sudo apt install nodejs npm
    echo "${green}Node is installed [✓]${reset}"
  fi
else
  echo "${green}Node is installed [✓]${reset}"
fi
if ! [ -x "$(command -v git)" ]; then
  if ! [ -x "$(command -v brew)" ]; then
    echo "${red}git is not installed. Please visit https://desktop.github.com/ and install to continue!' >&2${reset}"
    echo "If youre on macOS type the following command into terminal > /usr/bin/ruby -e \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)\""
  else
    echo 'Attempting to install git!'
    brew install git
    echo "${red}Please try to restart script${reset}"
  fi
  if ! [ -x "$(command -v apt-get)" ]; then
    echo "${red}git is not installed. Please visit https://desktop.github.com/ and install to continue!' >&2${reset}"
  else
    echo 'Attempting to install git!'
    sudo apt install git
    echo "${red}Please try to restart script${reset}"
  fi
  exit 1
else
  echo "${green}Git  is installed [✓]${reset}"
  if [[ $* == *--keep* ]]; then
    echo "${green}Keeping repo setup!${reset}"
  else
    echo "${red}Removing all traces of git within project${reset}"
    rm -rf .git
  fi
fi

if [ -f "package.json" ]; then
  echo "${green}package.json found!${reset}"
  download_packages
else
  echo 'Running npm init -y and creating package.json'
  npm init -y
  download_packages
fi

if [ -f "app.js" ]; then
  echo "${color} (づ｡◕‿‿◕｡)づ AlMosT DoNe! ${reset}"
  echo "${green}Starting your server!${reset}"
  echo "From now on to run the server run: ${yellow}node app.js${reset}"
  echo "Thank you for trying my template! Enjoy! ${blue}-Niko Kent :)${reset}"
  node app.js
else
  echo 'Cloning node js template from git'
  git clone https://github.com/nikokent/nodejs-template.git
  rm -rf .git
fi
