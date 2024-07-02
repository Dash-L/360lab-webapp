{ pkgs ? import <nixpkgs> {} }:

with pkgs; stdenv.mkDerivation {
  name = "webdev-env";
  nativeBuildInputs = [
    pnpm
    nodejs
    nodePackages.typescript-language-server
    nodePackages.prettier
  ];
}
