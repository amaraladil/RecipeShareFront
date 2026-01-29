export interface ValidationErrorDetail {
  type: string
  loc: (string | number)[]
  msg: string
  input: any
  ctx?: Record<string, any>
}

export interface ParsedFieldError {
  field: string
  message: string
  type: string
  path: string[]
}

/**
 * Parse validation errors from FastAPI response
 *
 * @param errors - Array of validation error details from API
 * @returns Array of parsed field errors ready for display
 *
 * @example
 * const errors = parseValidationErrors(response.data.detail)
 * // => [{ field: 'ingredients #1 → amount', message: 'Amount must be greater than 0', ... }]
 */
export function parseValidationErrors(
  errors: ValidationErrorDetail[]
): ParsedFieldError[] {
  return errors.map((error) => {
    // Remove 'body' from location path (FastAPI includes it)
    const path = error.loc.slice(1)

    // Create human-readable field name
    const field = formatFieldPath(path)

    // Get user-friendly message
    const message = formatErrorMessage(error)

    return {
      field,
      message,
      type: error.type,
      path: path.map(String)
    }
  })
}

/**
 * Format a field path into a human-readable string
 *
 * @example
 * formatFieldPath(['ingredients', 0, 'amount'])
 * // => 'ingredients #1 → amount'
 *
 * formatFieldPath(['title'])
 * // => 'title'
 */
function formatFieldPath(path: (string | number)[]): string {
  if (path.length === 0) return 'form'

  const parts: string[] = []

  for (let i = 0; i < path.length; i++) {
    const segment = path[i]

    if (typeof segment === 'number') {
      // It's an array index - combine with previous segment
      const prevSegment = path[i - 1]
      if (typeof prevSegment === 'string') {
        // Remove the previous part and add combined version
        parts.pop()
        parts.push(`${prevSegment} #${segment + 1}`)
      }
    } else {
      parts.push(segment)
    }
  }

  return parts.join(' → ')
}

/**
 * Format error message to be user-friendly
 *
 * Converts technical Pydantic error messages into readable text
 */
function formatErrorMessage(error: ValidationErrorDetail): string {
  const { type, msg, loc } = error

  switch (type) {
    case 'greater_than':
      return `${getFieldName(loc)} must be greater than ${error.ctx?.gt?.source || 0}`

    case 'greater_than_equal':
      return `${getFieldName(loc)} must be at least ${error.ctx?.ge?.source || 0}`

    case 'less_than':
      return `${getFieldName(loc)} must be less than ${error.ctx?.lt?.source}`

    case 'string_too_short':
      return `${getFieldName(loc)} must be at least ${error.ctx?.min_length} characters`

    case 'string_too_long':
      return `${getFieldName(loc)} must be no more than ${error.ctx?.max_length} characters`

    case 'missing':
      return `${getFieldName(loc)} is required`

    case 'value_error':
      return msg.replace(/^Value error,?\s*/i, '')

    case 'string_type':
      return `${getFieldName(loc)} must be text`

    case 'int_type':
    case 'float_type':
      return `${getFieldName(loc)} must be a number`

    case 'bool_type':
      return `${getFieldName(loc)} must be true or false`

    case 'list_type':
      return `${getFieldName(loc)} must be a list`

    default:
      return msg
  }
}

/**
 * Get a readable field name from the location path
 */
function getFieldName(loc: (string | number)[]): string {
  const path = loc.slice(1) // Remove 'body'
  if (path.length === 0) return 'This field'

  // Get the last non-numeric segment
  const fieldName =
    path.filter((s) => typeof s === 'string').pop() || 'This field'

  // Convert from snake_case to Title Case
  return fieldName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Map backend field path to frontend form field identifier
 *
 * Used to link validation errors to specific form inputs
 *
 * @example
 * mapErrorToFormField(['ingredients', '0', 'amount'])
 * // => 'ingredient-0-amount'
 */
export function mapErrorToFormField(path: string[]): string {
  if (path.length === 0) return 'general'

  if (path.includes('ingredients') && path.length >= 2) {
    const index = path[1]
    const field = path[2] || 'name'
    return `ingredient-${index}-${field}`
  }

  if (path.includes('steps') && path.length >= 2) {
    const index = path[1]
    return `step-${index}`
  }

  return path[0]
}

/**
 * Group errors by field for display
 *
 * @example
 * const grouped = groupErrorsByField(errors)
 * // => { 'ingredients #1 → amount': ['Amount must be greater than 0'], ... }
 */
export function groupErrorsByField(
  errors: ParsedFieldError[]
): Record<string, string[]> {
  return errors.reduce(
    (acc, error) => {
      if (!acc[error.field]) {
        acc[error.field] = []
      }
      acc[error.field].push(error.message)
      return acc
    },
    {} as Record<string, string[]>
  )
}

/**
 * Check if error is a validation error (422)
 */
export function isValidationError(error: any): boolean {
  return error?.statusCode === 422 || error?.status === 422
}

/**
 * Extract validation errors from API error response
 */
export function extractValidationErrors(error: any): ValidationErrorDetail[] {
  if (!isValidationError(error)) {
    return []
  }

  // Handle different possible error structures
  return error?.data?.detail || error?.detail || []
}
