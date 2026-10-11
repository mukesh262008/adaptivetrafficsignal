#include <stdio.h>

#define MAX 5

struct Stack {
    int top;
    int items[MAX];
};

void initialize(struct Stack *stack) {
    stack->top = -1;
}

int isFull(struct Stack *stack) {
    return stack->top == MAX - 1;
}

int isEmpty(struct Stack *stack) {
    return stack->top == -1;
}

void push(struct Stack *stack, int value) {
    if (isFull(stack)) {
        printf("Stack is full.\n");
        return;
    }
    stack->items[++stack->top] = value;
    printf("Pushed %d\n", value);
}

int pop(struct Stack *stack) {
    if (isEmpty(stack)) {
        printf("Stack is empty.\n");
        return -1;
    }
    return stack->items[stack->top--];
}

int peek(struct Stack *stack) {
    if (isEmpty(stack)) {
        printf("Stack is empty.\n");
        return -1;
    }
    return stack->items[stack->top];
}

void display(struct Stack *stack) {
    int i;
    printf("Stack: ");
    if (isEmpty(stack)) {
        printf("[empty]\n");
        return;
    }

    for (i = stack->top; i >= 0; i--) {
        printf("%d ", stack->items[i]);
    }
    printf("\n");
}

int main(void) {
    struct Stack stack;
    initialize(&stack);

    printf("Data Structure Example: Stack\n");
    push(&stack, 10);
    push(&stack, 20);
    push(&stack, 30);
    display(&stack);

    printf("Top element: %d\n", peek(&stack));
    printf("Popped: %d\n", pop(&stack));
    display(&stack);

    return 0;
}
