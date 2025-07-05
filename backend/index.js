import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
// import fs from 'fs/promises';
import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';

import util from 'util';
import YAML from 'yaml';
const execPromise = util.promisify(exec);

const app = express();
const APTOS_DIR = '/app/aptos';
const MOVE_FILE = path.join(APTOS_DIR, 'sources', 'project.move');

app.use(cors());
app.use(bodyParser.json());


async function updateMoveTomlAddress(newAddress) {
  const moveTomlPath = path.join(APTOS_DIR, 'Move.toml');
  if (!fs.existsSync(moveTomlPath)) {
    throw new Error('Move.toml does not exist.');
  }
  let content = await fs.promises.readFile(moveTomlPath, 'utf8');
  // Ensure address starts with 0x
  const addressWith0x = newAddress.startsWith('0x') ? newAddress : `0x${newAddress}`;
  // Replace only the contname value under [addresses]
  content = content.replace(
    /(\[addresses\][\s\S]*?contname\s*=\s*")[^"]*(")/,
    `$1${addressWith0x}$2`
  );
  await fs.promises.writeFile(moveTomlPath, content, 'utf8');
}

//write a function to update move toml project name and address name based on the move code given by the user
async function updateMoveTomlProjectNameAndAddress(moveCode) {
  const moveTomlPath = path.join(APTOS_DIR, 'Move.toml');
  if (!fs.existsSync(moveTomlPath)) {
    throw new Error('Move.toml does not exist.');
  }
  let content = await fs.promises.readFile(moveTomlPath, 'utf8');

  // Extract the module declaration, e.g., "module SendMessage::sendMessage"
  const moduleMatch = moveCode.match(/module\s+([a-zA-Z_][a-zA-Z0-9_]*)::([a-zA-Z_][a-zA-Z0-9_]*)/);
  if (!moduleMatch) {
    throw new Error('Move code does not contain a valid module declaration.');
  }
  const addressName = moduleMatch[1]; // e.g., SendMessage
  const moduleName = moduleMatch[2];  // e.g., sendMessage

  // Update [package] name = "sendMessage"
  content = content.replace(
    /(\[package\][\s\S]*?name\s*=\s*")[^"]*(")/,
    `$1${moduleName}$2`
  );

  // change only the key name after [addresses], not the value (preserve the existing value)
  content = content.replace(
    /(\[addresses\][\s\r\n]*)([a-zA-Z0-9_]+)(\s*=\s*"[^"]*")/,
    `$1${addressName}$3`
  );

  await fs.promises.writeFile(moveTomlPath, content, 'utf8');
}
// Add and init route to initialize aptos and get the address in response


app.post('/init', async (req, res) => {
  try {

    const { privateKey } = req.body; // Get privateKey from request body
    // Store in a variable for later use
    let userPrivateKey = privateKey || '';

    // 1. Check if aptos CLI is installed and in PATH
    try {
      await execPromise('aptos --version');
    } catch (cliErr) {
      return res.status(500).json({
        success: false,
        step: 'aptos_cli_missing',
        error: 'Aptos CLI is not installed or not in PATH.',
        details: cliErr.message,
      });
    }
    // 2. Check if /app/aptos directory exists
    if (!fs.existsSync(APTOS_DIR)) {
      return res.status(500).json({
        success: false,
        step: 'aptos_dir_missing',
        error: '/app/aptos directory does not exist.',
      });
    }
    // 3. Initialize Aptos CLI

    exec(`yes "${userPrivateKey}" | aptos init --network testnet --assume-yes`, { cwd: APTOS_DIR }, async (err, stdout, stderr) => {
      if (err) {
        return res.status(500).json({
          success: false,
          step: 'aptos_init_failed',
          error: 'Failed to initialize Aptos CLI.',
          details: stderr || stdout,
        });
      }
      // Parse the config.yaml to get the address
      // ...inside exec callback in /init route...
      try {
        const configPath = path.join(APTOS_DIR, '.aptos', 'config.yaml');
        if (!fs.existsSync(configPath)) {
          return res.status(500).json({
            success: false,
            step: 'config_missing',
            error: 'Aptos config.yaml file does not exist.',
          });
        }

        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = YAML.parse(configContent);
        const address = config.profiles && config.profiles.default && config.profiles.default.account;

        // if (!address) {
        //   return res.status(500).json({
        //     success: false,
        //     step: 'address_not_found',
        //     error: 'Account address not found in config.yaml.',
        //   });
        // }

        try {
          await updateMoveTomlAddress(address);
        } catch (e) {
          return res.status(500).json({
            success: false,
            step: 'move_toml_update_failed',
            error: 'Failed to update Move.toml: ' + e.message,
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Aptos CLI initialized successfully.',
          address: address,
        });
      } catch (e) {
        return res.status(500).json({
          success: false,
          step: 'unexpected_exception',
          error: 'Internal server error: ' + e.message,
        });
      }
      // ...existing code...
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      step: 'unexpected_exception',
      error: 'Internal server error: ' + e.message,
    });
  }
});


// add an endpoint to remove the .aptos folder
app.get('/remove-aptos', async (req, res) => {
    const dirsToRemove = [
    '/app/aptos/.aptos',
    '/app/.aptos',
    '/app/aptos/.move',
    '/app/aptos/build'
  ];
  let removed = [];
  let errors = [];

  let pending = dirsToRemove.length;
  dirsToRemove.forEach((aptosDir) => {
    if (!fs.existsSync(aptosDir)) {
      pending--;
      if (pending === 0) {
        if (removed.length > 0) {
          return res.status(200).json({
            success: true,
            message: `Removed: ${removed.join(', ')}. Some directories did not exist.`,
          });
        } else {
          return res.status(404).json({
            success: false,
            step: 'aptos_dir_missing',
            error: 'None of the target directories exist.',
          });
        }
      }
      return;
    }
    fs.rmdir(aptosDir, { recursive: true }, (err) => {
      pending--;
      if (err) {
        errors.push({ dir: aptosDir, error: err.message });
      } else {
        removed.push(aptosDir);
      }
      if (pending === 0) {
        if (errors.length > 0) {
          return res.status(500).json({
            success: false,
            step: 'remove_aptos_failed',
            error: 'Failed to remove one or more directories.',
            details: errors,
            removed,
          });
        } else {
          return res.status(200).json({
            success: true,
            message: `Removed: ${removed.join(', ')}`,
          });
        }
      }
    });
  });
});

app.post('/compile', async (req, res) => {
  const { moveCode } = req.body;

  if (!moveCode) {
    return res.status(400).json({ error: 'No Move code provided.' });
  }

  //call function to update Move.toml project name and addressname
  try {
    await updateMoveTomlProjectNameAndAddress(moveCode);
  } catch (e) {
    return res.status(500).json({
      success: false,
      step: 'move_toml_update_failed',
      error: 'Failed to update Move.toml: ' + e.message,
    });
  }

  try {
    // 1. Check if aptos CLI is installed and in PATH
    try {
      await execPromise('aptos --version');
    } catch (cliErr) {
      return res.status(500).json({
        success: false,
        step: 'aptos_cli_missing',
        error: 'Aptos CLI is not installed or not in PATH.',
        details: cliErr.message,
      });
    }

    // 2. Check if /app/aptos directory exists
    if (!fs.existsSync(APTOS_DIR)) {
      return res.status(500).json({
        success: false,
        step: 'aptos_dir_missing',
        error: '/app/aptos directory does not exist.',
      });
    }

    // 3. Check if move.toml and sources/ exist
    const moveToml = path.join(APTOS_DIR, 'Move.toml');
    const sourcesDir = path.join(APTOS_DIR, 'sources');
    if (!fs.existsSync(moveToml) || !fs.existsSync(sourcesDir)) {
      return res.status(500).json({
        success: false,
        step: 'Move_package_invalid',
        error: 'Move.toml or sources/ directory is missing in /app/aptos.',
      });
    }

    // 4. Check permissions for writing to sources/
    try {
      await fs.promises.access(sourcesDir, fs.constants.W_OK);
    } catch (permErr) {
      return res.status(500).json({
        success: false,
        step: 'permission_error',
        error: 'No write permission to /app/aptos/sources.',
        details: permErr.message,
      });
    }

    // Save user code
    await fs.promises.writeFile(MOVE_FILE, moveCode);



    // Compile Move code using Aptos CLI
    exec(`aptos move compile --package-dir ${APTOS_DIR}`, (err, stdout, stderr) => {
      if (err) {
        return res.status(200).json({
          success: false,
          step: 'exec_error',
          error: err.message,
          log: stdout + (stderr ? '\n' + stderr : ''),
        });
      }
      // Compilation succeeded, but there may be messages in stderr (like progress info)
      res.status(200).json({
        success: true,
        output: stdout,
        log: stdout + (stderr ? '\n' + stderr : ''),
      });
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      step: 'unexpected_exception',
      error: 'Internal server error: ' + e.message,
    });
  }
});

app.post('/deploy', async (req, res) => {
  const { moveCode } = req.body;

  if (!moveCode) {
    return res.status(400).json({ error: 'No Move code provided.' });
  }


  //call function to update Move.toml project name and addressname
  try {
    await updateMoveTomlProjectNameAndAddress(moveCode);
  } catch (e) {
    return res.status(500).json({
      success: false,
      step: 'move_toml_update_failed',
      error: 'Failed to update Move.toml: ' + e.message,
    });
  }


  try {
    // 1. Check if aptos CLI is installed and in PATH
    try {
      await execPromise('aptos --version');
    } catch (cliErr) {
      return res.status(500).json({
        success: false,
        step: 'aptos_cli_missing',
        error: 'Aptos CLI is not installed or not in PATH.',
        details: cliErr.message,
      });
    }

    // 2. Check if /app/aptos directory exists
    if (!fs.existsSync(APTOS_DIR)) {
      return res.status(500).json({
        success: false,
        step: 'aptos_dir_missing',
        error: '/app/aptos directory does not exist.',
      });
    }

    // 3. Check if move.toml and sources/ exist
    const moveToml = path.join(APTOS_DIR, 'Move.toml');
    const sourcesDir = path.join(APTOS_DIR, 'sources');
    if (!fs.existsSync(moveToml) || !fs.existsSync(sourcesDir)) {
      return res.status(500).json({
        success: false,
        step: 'Move_package_invalid',
        error: 'Move.toml or sources/ directory is missing in /app/aptos.',
      });
    }

    // 4. Check permissions for writing to sources/
    try {
      await fs.promises.access(sourcesDir, fs.constants.W_OK);
    } catch (permErr) {
      return res.status(500).json({
        success: false,
        step: 'permission_error',
        error: 'No write permission to /app/aptos/sources.',
        details: permErr.message,
      });
    }

    // Save user code
    await fs.promises.writeFile(MOVE_FILE, moveCode);



    console.log('Deploy working directory:', process.cwd());
    console.log('Deploy HOME env:', process.env.HOME);


    // Copy .aptos folder from /app/aptos/.aptos to /app/.aptos if it doesn't exist
    const srcAptosDir = path.join(APTOS_DIR, '.aptos');
    const destAptosDir = '/app/.aptos';
    if (!fs.existsSync(destAptosDir)) {
      // Use shell command to copy recursively
      try {
        await execPromise(`cp -r ${srcAptosDir} ${destAptosDir}`);
        console.log('.aptos folder copied to /app/');
      } catch (copyErr) {
        console.error('Failed to copy .aptos folder:', copyErr);
        return res.status(500).json({
          success: false,
          step: 'copy_dot_aptos_failed',
          error: 'Failed to copy .aptos folder to /app/',
          details: copyErr.message,
        });
      }
    }


    // Deploy Move code using Aptos CLI
    exec(
      `aptos move deploy --assume-yes --package-dir ${APTOS_DIR}`,
      { env: { ...process.env, HOME: APTOS_DIR } }, // <--- set HOME to /app/aptos
      (err, stdout, stderr) => {
        if (err) {
          console.error('Deploy command error:', err);
          console.error('Deploy stdout:', stdout);
          console.error('Deploy stderr:', stderr);
          return res.status(200).json({
            success: false,
            step: 'exec_error',
            error: err.message,
            log: stdout + (stderr ? '\n' + stderr : ''),
          });
        }
        res.status(200).json({
          success: true,
          output: stdout,
          log: stdout + (stderr ? '\n' + stderr : ''),
        });
      }
    );
  } catch (e) {
    console.error('Unexpected exception in /deploy:', e);

    res.status(500).json({

      success: false,
      step: 'unexpected_exception',
      error: 'Internal server error: ' + e.message,
    });
  }
});



app.listen(3000, () => {
  console.log('Aptos Move backend is running at http://localhost:3000');
});