#include <stdio.h>

#define MAX 10

void displayArray(int arr[], int size) {
    int i;
    printf("Array: ");
    if (size == 0) {
        printf("[empty]\n");
        return;
    }

    for (i = 0; i < size; i++) {
        printf("%d ", arr[i]);
    }
    printf("\n");
}

int linearSearch(int arr[], int size, int target) {
    int i;
    for (i = 0; i < size; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}

void insertElement(int arr[], int *size, int index, int value) {
    int i;
    if (*size >= MAX) {
        printf("Array is full. Cannot insert more elements.\n");
        return;
    }
    if (index < 0 || index > *size) {
        printf("Invalid index.\n");
        return;
    }

    for (i = *size; i > index; i--) {
        arr[i] = arr[i - 1];
    }
    arr[index] = value;
    (*size)++;
}

void deleteElement(int arr[], int *size, int index) {
    int i;
    if (index < 0 || index >= *size) {
        printf("Invalid index for deletion.\n");
        return;
    }

    for (i = index; i < *size - 1; i++) {
        arr[i] = arr[i + 1];
    }
    (*size)--;
}

int main(void) {
    int numbers[MAX] = {12, 25, 30, 42, 57};
    int size = 5;

    printf("Data Structure Example: Array\n");
    displayArray(numbers, size);

    insertElement(numbers, &size, 2, 99);
    displayArray(numbers, size);

    printf("Search for 42: index %d\n", linearSearch(numbers, size, 42));

    deleteElement(numbers, &size, 3);
    displayArray(numbers, size);

    return 0;
}
