"""
FILE: backend/games/bingo/logic.py
PURPOSE: Pure functions for 1–25 Bingo card generation, marking, line counting,
         and winning line coordinate detection.
"""

import random
from typing import List, Tuple

from games.bingo.constants import GRID_SIZE, TOTAL_NUMBERS


def generate_card() -> List[List[int]]:
    """Generate a 5×5 card with a random permutation of numbers 1 to 25."""
    nums = list(range(1, TOTAL_NUMBERS + 1))
    random.shuffle(nums)
    # Reshape into 5×5 grid
    card = []
    for r in range(GRID_SIZE):
        card.append(nums[r * GRID_SIZE : (r + 1) * GRID_SIZE])
    return card


def mark_number(card: List[List[int]], marked: List[List[bool]], number: int) -> bool:
    """Find number on card and mark it. Returns True if found."""
    for r in range(GRID_SIZE):
        for c in range(GRID_SIZE):
            if card[r][c] == number:
                marked[r][c] = True
                return True
    return False


def count_completed_lines(marked: List[List[bool]]) -> int:
    """
    Count completed lines across 5 rows, 5 columns, and 2 diagonals.
    Max possible = 12 lines.
    """
    if not marked or len(marked) != GRID_SIZE:
        return 0

    count = 0

    # 5 Rows
    for r in range(GRID_SIZE):
        if all(marked[r][c] for c in range(GRID_SIZE)):
            count += 1

    # 5 Columns (iterate row index r for fixed column c)
    for c in range(GRID_SIZE):
        if all(marked[r][c] for r in range(GRID_SIZE)):
            count += 1

    # Main diagonal (top-left to bottom-right)
    if all(marked[i][i] for i in range(GRID_SIZE)):
        count += 1

    # Anti-diagonal (top-right to bottom-left)
    if all(marked[i][GRID_SIZE - 1 - i] for i in range(GRID_SIZE)):
        count += 1

    return count


def get_winning_lines(marked: List[List[bool]]) -> List[List[Tuple[int, int]]]:
    """Return all completed lines as lists of (row, col) tuples for UI highlighting."""
    if not marked or len(marked) != GRID_SIZE:
        return []

    lines = []

    # 5 Rows
    for r in range(GRID_SIZE):
        if all(marked[r][c] for c in range(GRID_SIZE)):
            lines.append([(r, c) for c in range(GRID_SIZE)])

    # 5 Columns (iterate row index r for fixed column c)
    for c in range(GRID_SIZE):
        if all(marked[r][c] for r in range(GRID_SIZE)):
            lines.append([(r, c) for r in range(GRID_SIZE)])

    # Main diagonal
    if all(marked[i][i] for i in range(GRID_SIZE)):
        lines.append([(i, i) for i in range(GRID_SIZE)])

    # Anti-diagonal
    if all(marked[i][GRID_SIZE - 1 - i] for i in range(GRID_SIZE)):
        lines.append([(i, GRID_SIZE - 1 - i) for i in range(GRID_SIZE)])

    return lines
