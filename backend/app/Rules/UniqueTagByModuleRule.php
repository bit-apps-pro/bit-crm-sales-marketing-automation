<?php

namespace BitApps\Crm\Rules;

use BitApps\Crm\Deps\BitApps\WPValidator\Rule;

class UniqueTagByModuleRule extends Rule
{
    private $message = 'Tag already exists for the module!';

    private $model;

    private $ignoreId;

    private $column;

    public function __construct($model, $column, $customMessage = null)
    {
        $this->model = $model;
        $this->column = $column;
        if ($customMessage) {
            $this->message = $customMessage;
        }
    }

    public function validate($value)
    {
        /* TODO:
            Fix: This role is not receiving the validated value from the previous role validation of the same row (if there are any).
            Remove the sanitize_text_field() from here.
        */

        $moduleValue = $this->getInputDataContainer()->getAttributeValue('module');

        $query = $this->model::where($this->column, sanitize_text_field($value))->where('module', $moduleValue);

        if ($this->ignoreId) {
            $query->where('id', '!=', $this->ignoreId);
        }

        $result = $query->count();

        return \is_null($result) || $result == 0;
    }

    public function ignore($ignoreId)
    {
        $this->ignoreId = $ignoreId;

        return $this;
    }

    public function message()
    {
        return $this->message;
    }
}
