# General Info kosmtik-project-editor

Add basic project editing capabilities to your Kosmtik project, alpha stage.
Because of it's immaturity the plugin isn't published via NPM yet, this may happen in the feature.

# Features

- Sort project layers with Drag & Drop

## Screenshot

![screenshot](https://raw.github.com/florianf/kosmtik-project-editor/master/screenshot.png "Screenshot of Project Editor")

# Installation

To install from source do:

    git clone https://github.com/florianf/kosmtik-project-editor.git
    cd kosmtik-project-editor
    npm install

Edit or create your local kosmtik config file under *~/.config/kosmtik.yml* and add the kosmtik-project-editor folder to your plugins section.
Minimal required config file:

	plugins:
	  - PUT_PARENT_DIRECTORY_HERE/kosmtik-project-editor/index.js