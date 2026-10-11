#include <stdio.h>

#define MAX 5

struct Queue {
    int front, rear;
    int items[MAX];
};

void initialize(struct Queue *queue) {
    queue->front = -1;
    queue->rear = -1;
}

int isEmpty(struct Queue *queue) {
    return queue->front == -1;
}

int isFull(struct Queue *queue) {
    return (queue->rear + 1) % MAX == queue->front;
}

void enqueue(struct Queue *queue, int value) {
    if (isFull(queue)) {
        printf("Queue is full.\n");
        return;
    }

    if (isEmpty(queue)) {
        queue->front = 0;
    }

    queue->rear = (queue->rear + 1) % MAX;
    queue->items[queue->rear] = value;
    printf("Enqueued %d\n", value);
}

int dequeue(struct Queue *queue) {
    int value;
    if (isEmpty(queue)) {
        printf("Queue is empty.\n");
        return -1;
    }

    value = queue->items[queue->front];

    if (queue->front == queue->rear) {
        initialize(queue);
    } else {
        queue->front = (queue->front + 1) % MAX;
    }

    return value;
}

void display(struct Queue *queue) {
    int i;
    printf("Queue: ");
    if (isEmpty(queue)) {
        printf("[empty]\n");
        return;
    }

    for (i = queue->front; i != queue->rear; i = (i + 1) % MAX) {
        printf("%d ", queue->items[i]);
    }
    printf("%d\n", queue->items[queue->rear]);
}

int main(void) {
    struct Queue queue;
    initialize(&queue);

    printf("Data Structure Example: Queue\n");
    enqueue(&queue, 11);
    enqueue(&queue, 22);
    enqueue(&queue, 33);
    display(&queue);

    printf("Dequeued: %d\n", dequeue(&queue));
    display(&queue);

    return 0;
}
