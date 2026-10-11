#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node *next;
};

void insertAtBeginning(struct Node **head, int value) {
    struct Node *newNode = (struct Node *)malloc(sizeof(struct Node));
    newNode->data = value;
    newNode->next = *head;
    *head = newNode;
}

void insertAtEnd(struct Node **head, int value) {
    struct Node *newNode = (struct Node *)malloc(sizeof(struct Node));
    struct Node *temp = *head;

    newNode->data = value;
    newNode->next = NULL;

    if (*head == NULL) {
        *head = newNode;
        return;
    }

    while (temp->next != NULL) {
        temp = temp->next;
    }
    temp->next = newNode;
}

void displayList(struct Node *head) {
    struct Node *temp = head;
    printf("Linked List: ");

    if (head == NULL) {
        printf("[empty]\n");
        return;
    }

    while (temp != NULL) {
        printf("%d -> ", temp->data);
        temp = temp->next;
    }
    printf("NULL\n");
}

void deleteByValue(struct Node **head, int value) {
    struct Node *temp = *head;
    struct Node *prev = NULL;

    if (*head == NULL) {
        printf("List is empty.\n");
        return;
    }

    while (temp != NULL && temp->data != value) {
        prev = temp;
        temp = temp->next;
    }

    if (temp == NULL) {
        printf("Value %d not found.\n", value);
        return;
    }

    if (prev == NULL) {
        *head = temp->next;
    } else {
        prev->next = temp->next;
    }

    free(temp);
    printf("Deleted %d from the list.\n", value);
}

void freeList(struct Node *head) {
    struct Node *current = head;
    struct Node *next;

    while (current != NULL) {
        next = current->next;
        free(current);
        current = next;
    }
}

int main(void) {
    struct Node *head = NULL;

    printf("Data Structure Example: Linked List\n");
    insertAtEnd(&head, 10);
    insertAtEnd(&head, 20);
    insertAtBeginning(&head, 5);
    insertAtEnd(&head, 30);
    displayList(head);

    deleteByValue(&head, 20);
    displayList(head);

    freeList(head);
    return 0;
}
