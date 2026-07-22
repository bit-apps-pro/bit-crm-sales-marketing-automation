<?php

namespace BitApps\Crm\Factories;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Utils\Logger;
use InvalidArgumentException;
use ReflectionException;
use ReflectionMethod;
use Throwable;

class EntityFactory
{
    private static $entityServiceNamespace = 'BitApps\Crm\Services\\';

    private static string $module;

    public function __construct(string $module)
    {
        self::$module = $module;
    }

    public function __call(string $methodName, array $args): mixed
    {
        return $this->callMethod($methodName, $args);
    }

    public static function __callStatic(string $methodName, array $args): mixed
    {
        if ($methodName === 'module') {
            if (empty($args[0]) || !\is_string($args[0])) {
                throw new InvalidArgumentException('Module name must be provided.');
            }

            return new self($args[0]);
        }

        return self::callStaticMethod($methodName, $args);
    }

    /**
     * Create a factory instance for a specific module to enable method chaining.
     */
    public static function module(string $module): self
    {
        return new self($module);
    }

    public function callMethod(string $methodName, array $args = []): mixed
    {
        $serviceClass = self::resolveServiceClass($methodName);
        $serviceInstance = new $serviceClass();

        return \call_user_func_array([$serviceInstance, $methodName], $args);
    }

    /**
     * Call a static method on the service class.
     * This method can handle both static and instance methods automatically.
     */
    public static function callStaticMethod(string $methodName, array $args = []): mixed
    {
        $serviceClass = self::resolveServiceClass($methodName);

        try {
            $reflection = new ReflectionMethod($serviceClass, $methodName);

            if ($reflection->isStatic()) {
                return \call_user_func_array([$serviceClass, $methodName], $args);
            }

            $serviceInstance = new $serviceClass();

            return \call_user_func_array([$serviceInstance, $methodName], $args);
        } catch (ReflectionException $e) {
            throw new InvalidArgumentException('Error reflecting method ' . esc_html($methodName) . ' in ' . esc_html($serviceClass) . ': ' . esc_html($e->getMessage()));
        } catch (Throwable $th) {
            Logger::error('EntityFactory Error: ' . $th->getMessage());

            throw $th;
        }
    }

    private static function resolveServiceClass(string $methodName): string
    {
        if (empty(self::$module) || empty($methodName)) {
            throw new InvalidArgumentException('Module and method name must be provided.');
        }

        $serviceClassName = str_replace(' ', '', ucwords(str_replace('_', ' ', self::$module))) . 'Service';

        $serviceClass = self::$entityServiceNamespace . $serviceClassName;

        if (class_exists($serviceClass)) {
            if (!method_exists($serviceClass, $methodName)) {
                throw new InvalidArgumentException('Method ' . esc_html($methodName) . ' not found in ' . esc_html($serviceClass));
            }

            return $serviceClass;
        }

        $resolvedClass = Hooks::applyFilter(HookKeys::ENTITY_SERVICE_CLASS, null, self::$module);

        if ($resolvedClass !== null && class_exists($resolvedClass)) {
            if (!method_exists($resolvedClass, $methodName)) {
                throw new InvalidArgumentException('Method ' . esc_html($methodName) . ' not found in ' . esc_html($resolvedClass));
            }

            return $resolvedClass;
        }

        throw new InvalidArgumentException('Service class not found: ' . esc_html($serviceClassName));
    }
}
