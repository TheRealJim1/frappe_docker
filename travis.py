#!/bin/env python3

import argparse
import subprocess
import os

parser = argparse.ArgumentParser(description='frappe_docker common CI elements', add_help=True)

image_type = parser.add_mutually_exclusive_group(required=True)
image_type.add_argument('-a', '--nginx', action='store_const', dest='image_type', const='nginx', help='Build the nginx + static assets image')
image_type.add_argument('-s', '--socketio', action='store_const', dest='image_type', const='socketio', help='Build the frappe-socketio image')
image_type.add_argument('-w', '--worker', action='store_const', dest='image_type', const='worker', help='Build the python environment image')

parser.add_argument('service', action='store', type=str, help='Name of the service to build: "erpnext" or "frappe"')

tag_type = parser.add_mutually_exclusive_group(required=True)
tag_type.add_argument('-g', '--git-version', action='store', type=int, dest='version', help='The version number of --service (i.e. "11", "12", etc.)')
tag_type.add_argument('-t', '--tag', action='store', type=str, dest='tag', help='The image tag (i.e. erpnext-worker:$TAG )')

parser.add_argument('-o', '--tag-only', required=False, action='store_true', dest='tag_only', help='Only tag an image and push it.')

args = parser.parse_args()

print('image_type     = {!r}'.format(args.image_type))
print('service        = {!r}'.format(args.service))
print('version        = {!r}'.format(args.version))
print('tag            = {!r}'.format(args.tag))
print('tag_only       = {!r}'.format(args.tag_only))

def git_version(service, version):
  print(f'Pulling {service} v{version}')
  subprocess.run(f'git clone https://github.com/frappe/{service} --branch version-{version}', shell=True)
  cd = os.getcwd()
  os.chdir(os.getcwd() + f'/{service}')
  subprocess.run('git fetch --tags', shell=True)
  version_tag = subprocess.check_output(f'git tag --list --sort=-version:refname "v{version}*" | sed -n 1p | sed -e \'s#.*@\(\)#\\1#\'', shell=True).strip().decode('ascii')
  os.chdir(cd)
  return version_tag

def build(service, tag, image, dockerfile):
  print(f'Building {service} {image} image using {dockerfile}')
  subprocess.run(f'docker build -t {service}-{image} -f build/{service}-{image}/{dockerfile} .', shell=True)
  tag_and_push(f'{service}-{image}', tag)

def tag_and_push(image_name, tag):
  print(f'Tagging {image_name} as "{tag}" and pushing')
  subprocess.run(f'docker tag {image_name} frappe/{image_name}:{tag}', shell=True)
  subprocess.run(f'docker push frappe/{image_name}:{tag}', shell=True)

def main():
  global tag
  global dockerfile

  if args.version:
    tag = git_version(args.service, args.version)
    dockerfile = 'v{!r}.Dockerfile'.format(args.version)
  else:
    tag = args.tag
    dockerfile = 'Dockerfile'

  if args.tag_only:
    tag_and_push(f'{args.service}-{args.image_type}', tag)
  else:
    build(args.service, tag, args.image_type, dockerfile)

main()
