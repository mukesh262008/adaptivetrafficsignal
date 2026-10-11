CC = gcc
CFLAGS = -Wall -Wextra -std=c11

all: array_operations linked_list stack queue binary_tree

array_operations: array_operations.c
	$(CC) $(CFLAGS) $< -o $@

linked_list: linked_list.c
	$(CC) $(CFLAGS) $< -o $@

stack: stack.c
	$(CC) $(CFLAGS) $< -o $@

queue: queue.c
	$(CC) $(CFLAGS) $< -o $@

binary_tree: binary_tree.c
	$(CC) $(CFLAGS) $< -o $@

clean:
	rm -f array_operations linked_list stack queue binary_tree
