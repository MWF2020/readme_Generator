
const fs = require('fs');
const f = require('./src/formatters');
const schema = require(');
var options;


const parse_options = () => {
  var defaults = {
    input: false,
    debug: false,
    user_cwd: false,
    out_file: 'README.md',
    dry_run: false
  };

  var runtime_options = process.env.READMEGEN_ENV;
  if (runtime_options) {
    console.log('With options', runtime_options );
  } else {
    runtime_options = '{}';
  }

  var _options = Object.assign({}, defaults, JSON.parse(runtime_options));

  if (_options.debug) {
    console.log('process env', process.env.READMEGEN_ENV );
    console.log('current options', _options );
  }

  return _options;
};

if (process.env.npm_package_version){
  var my_pkg = process.env.npm_package_version;
} else {
  options = parse_options();
  if (options.debug) {
    console.log('program options', options);
  }

  var base_dir = options.user_cwd;
  try {
    if (fs.existsSync(`${base_dir}/package.json`)) {
      my_pkg = require(`${base_dir}/package`);
    } else {
      console.error('No package.json file could be found');
      process.exit(0);
    }
  } catch(err) {
    console.error(err);
  }
}



var pkg = Object.assign(Object.create(null), schema, my_pkg);
var readme = [];

// CREATE THE README OBJECT
readme.push(f.h1(pkg.name));
readme.push(f.blockquot(pkg.description ));
readme.push(f.key_value('Version', pkg.version),f.br);
readme.push(f.br);
readme.push('Topics: ');
for (var word of pkg.keywords){
  readme.push(f.link(word, `s/${word}`));
  readme.push(',  ');
}
readme.push(f.br);
readme.push(f.br);
readme.push(f.h2('About'));
readme.push(f.link(pkg.homepage, pkg.homepage), f.br);
readme.push(f.h3('Author'));
readme.push(f.obj_to_list(pkg.author));
readme.push(f.br,f.br,f.line,f.br);
readme.push(f.h3('Project Repo'));
readme.push(f.obj_to_list(pkg.repository),f.br);
readme.push(f.h2('Dependencies'));
readme.push(f.obj_to_list(pkg.dependencies),f.br);
readme.push(f.h3('Config Options'));
readme.push(f.obj_to_list(pkg.config),f.br);
readme.push(f.h2('Usage'));
readme.push(f.obj_to_list(pkg.scripts),f.br);
readme.push(f.h2('Development'));
readme.push(f.obj_to_list(pkg.devDependencies),f.br);
readme.push(f.h3('Contributors'));
readme.push(f.obj_to_list(pkg.contributors),f.br);
readme.push(f.h3('Issues'));
readme.push(f.obj_to_list(pkg.bugs),f.br);
readme.push(f.br);
readme.push(f.line);
readme.push(f.br);
readme.push(f.h3('Licesnse'));
readme.push(pkg.license);

readme.push('\n\n');


const readme_data = readme.join('');
var readme_file = './README.md';


try {
  if (fs.existsSync(readme_file)) {
    readme_file = 'PACKAGE_README.md';
  }
} catch(err) {
  console.error(err);
}


fs.open(readme_file, 'wx', (err, fd) => {
  if (err) {
    if (err.code === 'EEXIST') {
      if (options.overwrite_existing){
        console.log('Notice: README file exists... ');
        console.log('Command ran with  "--force" flag, continuing file save.');
      
      } else {
        console.log('README data', readme_data);
        console.error(`${readme_file} already exists`);
        return;
        throw err;
      }
    }
  }
  fs.writeFileSync(readme_file, readme_data);
});
