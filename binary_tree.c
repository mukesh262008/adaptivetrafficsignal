#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node *left;
    struct Node *right;
};

struct Node *createNode(int value) {
    struct Node *newNode = (struct Node *)malloc(sizeof(struct Node));
    newNode->data = value;
    newNode->left = NULL;
    newNode->right = NULL;
    return newNode;
}

struct Node *insertNode(struct Node *root, int value) {
    if (root == NULL) {
        return createNode(value);
    }

    if (value < root->data) {
        root->left = insertNode(root->left, value);
    } else if (value > root->data) {
        root->right = insertNode(root->right, value);
    }

    return root;
}

void inorderTraversal(struct Node *root) {
    if (root == NULL) {
        return;
    }

    inorderTraversal(root->left);
    printf("%d ", root->data);
    inorderTraversal(root->right);
}

int searchNode(struct Node *root, int value) {
    if (root == NULL) {
        return 0;
    }

    if (root->data == value) {
        return 1;
    }

    if (value < root->data) {
        return searchNode(root->left, value);
    }

    return searchNode(root->right, value);
}

void freeTree(struct Node *root) {
    if (root == NULL) {
        return;
    }

    freeTree(root->left);
    freeTree(root->right);
    free(root);
}

int main(void) {
    struct Node *root = NULL;
    int values[] = {50, 30, 70, 20, 40, 60, 80};
    int size = sizeof(values) / sizeof(values[0]);
    int i;

    printf("Data Structure Example: Binary Search Tree\n");
    for (i = 0; i < size; i++) {
        root = insertNode(root, values[i]);
    }

    printf("Inorder Traversal: ");
    inorderTraversal(root);
    printf("\n");

    printf("Search 40: %s\n", searchNode(root, 40) ? "Found" : "Not Found");
    printf("Search 90: %s\n", searchNode(root, 90) ? "Found" : "Not Found");

    freeTree(root);
    return 0;
}
