import os
import re
import glob
import sys
from pathlib import Path


def find_file_with_pathlib(filename, path):
    """
    Finds a file within a given path using the pathlib library.

    Args:
      filename: The name of the file to find.
      path: The path to the directory where the file might be located.

    Returns:
      The full path to the file if found, otherwise None.
    """
    for p in Path(path).rglob(filename):
        return str(p)  # Convert Path object to string
    return None


dirty = False


def update_wikilinks(file_path):
    """
    Updates wikilinks in a Markdown file from [[wikilink]] format to relative path format [[path/to/wikilink]].

    Args:
      file_path: Path to the Markdown file.
    """
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    global dirty
    dirty = False
    # Extract directory of the current file
    current_dir = os.path.dirname(file_path)

    def replace_wikilink(match):
        """
        Replaces a single wikilink with the relative path.
        """
        wikilink = match.group(1)
        target_file = os.path.join(
            current_dir, wikilink + ".md"
        )  # Assume .md extension

        if os.path.exists(target_file):
            relative_path = os.path.relpath(target_file, "d:/Programs/docusaurus/docs")
            relative_path = relative_path.replace("\\", "/").replace(".md", "")

            global dirty
            dirty = True
            print("[[" + relative_path + "]]")
            return "[[" + relative_path + "]]"
        else:
            result = find_file_with_pathlib(
                wikilink + ".md", "d:/Programs/docusaurus/docs"
            )
            if os.path.exists(target_file):
                relative_path = os.path.relpath(result, "d:/Programs/docusaurus/docs")
                relative_path = relative_path.replace("\\", "/").replace(".md", "")
                if relative_path != None:
                    dirty = True
                    print("[[" + relative_path + "]]")
                    return "[[" + relative_path + "]]"
            # Handle cases where the target file doesn't exist
            print(
                f"Warning: '{file_path}':Target file '{target_file}' for wikilink '{wikilink}' not found."
            )
            return match.group(0)  # Keep the original wikilink

    # Replace wikilinks using regular expression
    new_content = re.sub(r"\[\[(.*?)\]\]", replace_wikilink, content)

    if dirty == True:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)


# Example usage:
if __name__ == "__main__":
    # Update wikilinks in the current file
    # update_wikilinks("your_markdown_file.md")

    # Update wikilinks in all Markdown files in a directory

    root_dir = os.path.abspath(sys.argv[1])
    for filename in glob.iglob(root_dir + "/**/*.md", recursive=True):
        update_wikilinks(filename)
