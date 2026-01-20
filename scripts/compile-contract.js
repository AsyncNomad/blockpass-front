import fs from "fs";
import path from "path";
import solc from "solc";

const rootDir = path.resolve(process.cwd());
const contractPath = path.join(rootDir, "contracts", "BlockpassPass.sol");
const source = fs.readFileSync(contractPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "BlockpassPass.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors && output.errors.length) {
  const fatal = output.errors.filter((err) => err.severity === "error");
  if (fatal.length) {
    console.error(output.errors);
    process.exit(1);
  }
}

const contractOutput = output.contracts["BlockpassPass.sol"].BlockpassPass;
const artifact = {
  abi: contractOutput.abi,
  bytecode: `0x${contractOutput.evm.bytecode.object}`,
};

const outDir = path.join(rootDir, "src", "contracts");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "BlockpassPass.json"),
  JSON.stringify(artifact, null, 2),
  "utf8"
);

console.log("Contract artifact written to src/contracts/BlockpassPass.json");
