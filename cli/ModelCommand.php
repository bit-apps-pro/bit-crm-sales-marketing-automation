<?php

namespace BitApps\Crm\CLI;

use BitApps\Crm\Config;
use WP_CLI;

class ModelCommand
{
    public function model($args)
    {
        if (empty($args)) {
            WP_CLI::error('missing model name use wp bit-crm-sales-marketing-automation model "Model Name"');

            return;
        }

        $modelName = reset($args);

        if (empty($modelName) || !\is_string($modelName)) {
            WP_CLI::error('Invalid model name!');

            return;
        }

        $modelName = ucfirst($modelName);

        $modelFileContent = $this->getModelFielContent($modelName);

        $fileName = $modelName . '.php';

        $path = Config::get('BASEDIR')
        . DIRECTORY_SEPARATOR
        . 'app'
        . DIRECTORY_SEPARATOR
        . 'Model'
        . DIRECTORY_SEPARATOR;

        if (file_exists($path . $fileName)) {
            WP_CLI::warning('Model already exists!');

            return;
        }

        file_put_contents($path . $fileName, $modelFileContent);

        WP_CLI::success('Model created successfully');
    }

    private function getModelFielContent($modelName)
    {
        return "<?php

namespace BitApps\Crm\Model;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;

class {$modelName} extends Model
{
    protected \$prefix = Config::VAR_PREFIX;
}
";
    }
}
