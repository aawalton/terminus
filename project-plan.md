# Objective

I’d like to have a compact version of my skill tree in source control as a declarative source of truth.

When I make changes to the skill tree in source control, a pre-commit hook should automatically update the database accordingly. 

# Design

Syncing the skill tree as a pre-commit hook should give access to both the old and new versions of the skill tree, which should allow me to programmatically identify which skills should be removed, added or renamed. 

## Cases

### Skill Removed

Removing a skill from the skill tree should soft delete the corresponding skill from the database.

### Skill Added

Adding a skill to the skill tree should insert the skill into the database.

### Skill Reordered

When the order of skills changes, the database should be updated with the new order.

### Skill Renamed

This is the trickiest one. To make it clear that I intend to do a rename, I’ll use the syntax `old_name -> new_name`. When the pre-commit hook sees this syntax, it should rename the skill in the database and simplify the syntax to `new_name`, then commit the results. 

# Execution

- [x]  Create functions for each type of skill change
    - [x]  Skill removed
    - [x]  Skill added
    - [x]  Skill reordered
    - [x]  Skill renamed
- [x]  Create pre-commit hook script using husky
- [x]  Update script to validate format for declarative skill tree
- [x]  Update script to identify skill changes
- [x]  Update script to call skill change functions
- [x]  Update script to resolve renames
- [ ]  Write test to check declarative tree against database
