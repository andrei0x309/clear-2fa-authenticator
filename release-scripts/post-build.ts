import { foxyfyManifest } from './utils/firefoxify'


(async () => {

    const isFirefox = process.argv[2] === 'firefox';


    const fs = (await import('fs')).default
    const path = (await import('path')).default
    const pkg = JSON.parse(fs.readFileSync('dist/manifest.json').toString());
    fs.writeFileSync('dist/manifest.json', JSON.stringify(pkg, null, 2))
    const directory = 'dist/assets/';
    fs.readdir(directory, (err, files) => {
        files.forEach(file => {
          if(file.startsWith('content'))
                fs.unlinkSync( path.resolve(directory + file)) 
        });
    });

    await foxyfyManifest(isFirefox);

    console.log('Post build executed');

  })();
